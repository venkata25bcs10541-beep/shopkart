const assert = require('assert');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Set dummy JWT secret for testing
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.NODE_ENV = 'test';

const Customer = require('./models/customer.model');
const {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
} = require('./controllers/customer.controller');
const authMiddleware = require('./middlewares/auth.middleware');
const generateToken = require('./utils/generateToken');

// Mock response creator
function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    cookies: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    cookie(name, val, opts) {
      this.cookies[name] = { val, opts };
      return this;
    },
    clearCookie(name, opts) {
      delete this.cookies[name];
      this.clearedCookie = { name, opts };
      return this;
    },
  };
}

async function runTests() {
  console.log('--- Starting ShopKart Authentication Tests ---');

  // In-memory mock store for Customer model
  const db = [];

  Customer.findOne = async (filter) => {
    if (filter.email) {
      return db.find((c) => c.email.toLowerCase() === filter.email.toLowerCase()) || null;
    }
    return null;
  };

  Customer.findById = (id) => {
    const findCust = () => db.find((c) => String(c._id) === String(id));
    return {
      select: async (fields) => {
        const cust = findCust();
        if (!cust) return null;
        if (fields === '-password') {
          const { password, ...rest } = cust;
          return rest;
        }
        return cust;
      },
      then: (resolve, reject) => {
        try {
          const cust = findCust();
          if (!cust) return resolve(null);
          const custObj = {
            ...cust,
            save: async function () {
              const idx = db.findIndex((c) => String(c._id) === String(id));
              if (idx !== -1) {
                db[idx].password = this.password;
              }
              return this;
            },
          };
          resolve(custObj);
        } catch (err) {
          reject(err);
        }
      },
    };
  };

  Customer.create = async (doc) => {
    const newDoc = {
      _id: 'cust_' + (db.length + 1),
      ...doc,
      createdAt: new Date(),
    };
    db.push(newDoc);
    return newDoc;
  };

  // Test 1: Register validation - missing fields
  {
    const req = { body: { fullName: 'John Doe' } };
    const res = createMockRes();
    await registerCustomer(req, res);
    assert.strictEqual(res.statusCode, 400, 'Should return 400 on missing fields');
    assert.strictEqual(res.body.success, false);
    console.log('✔ Test 1 Passed: Register fails with 400 for missing fields');
  }

  // Test 2: Register validation - password too short (<6 chars)
  {
    const req = {
      body: {
        fullName: 'John Doe',
        email: 'john@gmail.com',
        password: '123',
        phone: '9876543210',
      },
    };
    const res = createMockRes();
    await registerCustomer(req, res);
    assert.strictEqual(res.statusCode, 400, 'Should return 400 for password < 6 chars');
    assert.strictEqual(res.body.success, false);
    console.log('✔ Test 2 Passed: Register fails with 400 for short password');
  }

  // Test 3: Register success
  {
    const req = {
      body: {
        fullName: 'John Doe',
        email: 'john@gmail.com',
        password: 'password123',
        phone: '9876543210',
      },
    };
    const res = createMockRes();
    await registerCustomer(req, res);
    assert.strictEqual(res.statusCode, 201, 'Should return 201 on successful register');
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.customer.email, 'john@gmail.com');
    assert.strictEqual(res.body.customer.password, undefined, 'Password must not be returned');

    // Verify stored password is bcrypt hash
    const stored = db.find((c) => c.email === 'john@gmail.com');
    assert.ok(stored.password.startsWith('$2b$'), 'Password must be hashed with bcrypt');
    assert.ok(await bcrypt.compare('password123', stored.password));
    console.log('✔ Test 3 Passed: Register succeeds (201), password hashed with bcrypt and not returned');
  }

  // Test 4: Register duplicate email -> 409
  {
    const req = {
      body: {
        fullName: 'Another John',
        email: 'john@gmail.com',
        password: 'anotherpassword',
        phone: '1122334455',
      },
    };
    const res = createMockRes();
    await registerCustomer(req, res);
    assert.strictEqual(res.statusCode, 409, 'Should return 409 for duplicate email');
    assert.strictEqual(res.body.success, false);
    console.log('✔ Test 4 Passed: Register fails with 409 on duplicate email');
  }

  // Test 5: Login - missing credentials -> 400
  {
    const req = { body: {} };
    const res = createMockRes();
    await loginCustomer(req, res);
    assert.strictEqual(res.statusCode, 400, 'Should return 400 on missing credentials');
    console.log('✔ Test 5 Passed: Login fails with 400 on missing credentials');
  }

  // Test 6: Login - invalid email -> 401
  {
    const req = { body: { email: 'nonexistent@gmail.com', password: 'password123' } };
    const res = createMockRes();
    await loginCustomer(req, res);
    assert.strictEqual(res.statusCode, 401, 'Should return 401 for wrong email');
    assert.strictEqual(res.body.message, 'Invalid credentials');
    console.log('✔ Test 6 Passed: Login fails with 401 on non-existent email without revealing reason');
  }

  // Test 7: Login - invalid password -> 401
  {
    const req = { body: { email: 'john@gmail.com', password: 'wrongpassword' } };
    const res = createMockRes();
    await loginCustomer(req, res);
    assert.strictEqual(res.statusCode, 401, 'Should return 401 for wrong password');
    assert.strictEqual(res.body.message, 'Invalid credentials');
    console.log('✔ Test 7 Passed: Login fails with 401 on wrong password without revealing reason');
  }

  // Test 8: Login - success -> sets HttpOnly cookie & returns 200
  let authToken = null;
  {
    const req = { body: { email: 'john@gmail.com', password: 'password123' } };
    const res = createMockRes();
    await loginCustomer(req, res);
    assert.strictEqual(res.statusCode, 200, 'Should return 200 on login success');
    assert.strictEqual(res.body.success, true);
    assert.ok(res.cookies.token, 'Must set cookie with name "token"');
    assert.strictEqual(res.cookies.token.opts.httpOnly, true, 'Cookie must have httpOnly: true');
    authToken = res.cookies.token.val;
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    assert.ok(decoded.id, 'JWT must contain customer id');
    console.log('✔ Test 8 Passed: Login sets HttpOnly JWT cookie and returns 200');
  }

  // Test 9: Protected Route - no token -> 401
  {
    const req = { cookies: {} };
    const res = createMockRes();
    let nextCalled = false;
    await authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401, 'Should return 401 when no token is present');
    assert.strictEqual(nextCalled, false);
    console.log('✔ Test 9 Passed: Protected route rejects missing token with 401');
  }

  // Test 10: Protected Route - invalid token -> 401
  {
    const req = { cookies: { token: 'invalid.token.here' } };
    const res = createMockRes();
    let nextCalled = false;
    await authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(res.statusCode, 401, 'Should return 401 for invalid token');
    assert.strictEqual(nextCalled, false);
    console.log('✔ Test 10 Passed: Protected route rejects invalid token with 401');
  }

  // Test 11: Protected Route - valid token -> attaches req.user
  {
    const req = { cookies: { token: authToken } };
    const res = createMockRes();
    let nextCalled = false;
    await authMiddleware(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true, 'next() should be called');
    assert.ok(req.user, 'req.user should be populated');
    assert.strictEqual(req.user.email, 'john@gmail.com');
    assert.strictEqual(req.user.password, undefined, 'req.user must not include password');

    // Call getProfile
    const profileRes = createMockRes();
    await getProfile(req, profileRes);
    assert.strictEqual(profileRes.statusCode, 200);
    assert.strictEqual(profileRes.body.email, 'john@gmail.com');
    assert.strictEqual(profileRes.body.password, undefined);
    console.log('✔ Test 11 Passed: Profile route (/customers/me) returns customer info without password');
  }

  // Test 12: Logout -> clears cookie
  {
    const req = {};
    const res = createMockRes();
    await logoutCustomer(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.clearedCookie, 'Cookie must be cleared');
    assert.strictEqual(res.clearedCookie.name, 'token');
    assert.strictEqual(res.clearedCookie.opts.httpOnly, true);
    console.log('✔ Test 12 Passed: Logout clears HttpOnly cookie and returns 200');
  }

  // Test 13: Bonus Challenge - change password
  {
    const customer = db.find((c) => c.email === 'john@gmail.com');
    const req = {
      user: customer,
      body: { oldPassword: 'password123', newPassword: 'newSecretPassword' },
    };
    const res = createMockRes();
    await changePassword(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);

    // Verify new password works and old one fails
    const updatedCustomer = db.find((c) => c.email === 'john@gmail.com');
    assert.ok(await bcrypt.compare('newSecretPassword', updatedCustomer.password));
    assert.ok(!(await bcrypt.compare('password123', updatedCustomer.password)));
    console.log('✔ Test 13 Passed: Bonus Change Password correctly verifies old password and saves new hash');
  }

  console.log('\n==========================================');
  console.log('All 13/13 Authentication Tests PASSED! 🎉');
  console.log('==========================================\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
