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
const Product = require('./models/product.model');
const {
  createProduct,
  getProducts,
  getProductById,
} = require('./controllers/product.controller');
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistCount,
} = require('./controllers/wishlist.controller');
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
      populate: (popOpts) => {
        const cust = findCust();
        if (!cust) return Promise.resolve(null);
        const populatedList = (cust.wishlist || []).map((prodId) => {
          return productDb.find((p) => String(p._id) === String(prodId)) || { _id: prodId };
        });
        return Promise.resolve({
          ...cust,
          wishlist: populatedList,
        });
      },
      then: (resolve, reject) => {
        try {
          const cust = findCust();
          if (!cust) return resolve(null);
          const custObj = {
            ...cust,
            wishlist: cust.wishlist || [],
            save: async function () {
              const idx = db.findIndex((c) => String(c._id) === String(id));
              if (idx !== -1) {
                db[idx].password = this.password;
                db[idx].wishlist = this.wishlist;
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
      wishlist: [],
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

  // ==========================================
  // LAB 03: PRODUCT CATALOG & DISCOVERY TESTS
  // ==========================================
  console.log('\n--- Starting ShopKart Product Catalog Tests ---');
  const productDb = [];

  Product.create = async (doc) => {
    // Generate valid 24-character hex ObjectId string for testing
    const hexId = (productDb.length + 1).toString().padStart(24, '0');
    const newDoc = {
      _id: hexId,
      ...doc,
      createdAt: new Date(),
    };
    productDb.push(newDoc);
    return newDoc;
  };

  Product.find = (filter = {}) => {
    let results = [...productDb];

    if (filter.name && filter.name.$regex) {
      const regex = new RegExp(filter.name.$regex, filter.name.$options || 'i');
      results = results.filter((p) => regex.test(p.name));
    }

    if (filter.category) {
      if (typeof filter.category === 'object' && filter.category.$regex) {
        const regex = new RegExp(filter.category.$regex, filter.category.$options || 'i');
        results = results.filter((p) => regex.test(p.category));
      } else {
        results = results.filter((p) => p.category.toLowerCase() === String(filter.category).toLowerCase());
      }
    }

    return {
      sort: (sortOpts = {}) => {
        if (sortOpts.price === 1) {
          results.sort((a, b) => a.price - b.price);
        } else if (sortOpts.price === -1) {
          results.sort((a, b) => b.price - a.price);
        }
        return Promise.resolve(results);
      },
    };
  };

  Product.findById = async (id) => {
    return productDb.find((p) => String(p._id) === String(id)) || null;
  };

  // Test 14: Product creation - missing fields -> 400
  {
    const req = { body: { name: 'Incomplete Item' } };
    const res = createMockRes();
    await createProduct(req, res);
    assert.strictEqual(res.statusCode, 400, 'Should return 400 when required fields are missing');
    assert.strictEqual(res.body.success, false);
    console.log('✔ Test 14 Passed: Create Product fails with 400 on missing fields');
  }

  // Test 15: Product creation - invalid price (<= 0) -> 400
  {
    const req = {
      body: {
        name: 'Keyboard',
        description: 'RGB keyboard',
        price: -50,
        category: 'Electronics',
        image: 'https://example.com/kb.jpg',
        stock: 5,
      },
    };
    const res = createMockRes();
    await createProduct(req, res);
    assert.strictEqual(res.statusCode, 400, 'Should return 400 on price <= 0');
    console.log('✔ Test 15 Passed: Create Product fails with 400 on invalid price <= 0');
  }

  // Test 16: Product creation - invalid stock (< 0) -> 400
  {
    const req = {
      body: {
        name: 'Keyboard',
        description: 'RGB keyboard',
        price: 2999,
        category: 'Electronics',
        image: 'https://example.com/kb.jpg',
        stock: -2,
      },
    };
    const res = createMockRes();
    await createProduct(req, res);
    assert.strictEqual(res.statusCode, 400, 'Should return 400 on stock < 0');
    console.log('✔ Test 16 Passed: Create Product fails with 400 on negative stock');
  }

  // Test 17: Product creation - success -> 201
  let createdProductId = null;
  {
    const req = {
      body: {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with blue switches.',
        price: 2999,
        category: 'Electronics',
        image: 'https://example.com/keyboard.jpg',
        stock: 10,
      },
    };
    const res = createMockRes();
    await createProduct(req, res);
    assert.strictEqual(res.statusCode, 201, 'Should return 201 on created product');
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.product.name, 'Mechanical Keyboard');
    createdProductId = res.body.product._id;
    console.log('✔ Test 17 Passed: Create Product succeeds with 201 and valid payload');
  }

  // Add more sample products to test filtering and sorting
  await Product.create({
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with ANC.',
    price: 4999,
    category: 'Electronics',
    image: 'https://example.com/headphones.jpg',
    stock: 25,
  });

  await Product.create({
    name: 'Cotton Graphic T-Shirt',
    description: '100% breathable organic cotton tee.',
    price: 799,
    category: 'Fashion',
    image: 'https://example.com/tshirt.jpg',
    stock: 50,
  });

  // Test 18: Get all products -> 200 with count
  {
    const req = { query: {} };
    const res = createMockRes();
    await getProducts(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.count, 3);
    assert.strictEqual(res.body.products.length, 3);
    console.log('✔ Test 18 Passed: Get All Products returns list with correct count');
  }

  // Test 19: Search products (case-insensitive)
  {
    const req = { query: { search: 'keyboard' } };
    const res = createMockRes();
    await getProducts(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.count, 1);
    assert.strictEqual(res.body.products[0].name, 'Mechanical Keyboard');
    console.log('✔ Test 19 Passed: Search filters products case-insensitively by name');
  }

  // Test 20: Filter products by category
  {
    const req = { query: { category: 'Fashion' } };
    const res = createMockRes();
    await getProducts(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.count, 1);
    assert.strictEqual(res.body.products[0].name, 'Cotton Graphic T-Shirt');
    console.log('✔ Test 20 Passed: Category filtering returns products strictly from specified category');
  }

  // Test 21: Bonus Challenge - Sorting (price_asc and price_desc)
  {
    const reqAsc = { query: { sort: 'price_asc' } };
    const resAsc = createMockRes();
    await getProducts(reqAsc, resAsc);
    assert.strictEqual(resAsc.body.products[0].price, 799, 'Lowest price first in price_asc');
    assert.strictEqual(resAsc.body.products[2].price, 4999);

    const reqDesc = { query: { sort: 'price_desc' } };
    const resDesc = createMockRes();
    await getProducts(reqDesc, resDesc);
    assert.strictEqual(resDesc.body.products[0].price, 4999, 'Highest price first in price_desc');
    assert.strictEqual(resDesc.body.products[2].price, 799);
    console.log('✔ Test 21 Passed: Bonus price sorting works accurately for price_asc and price_desc');
  }

  // Test 22: Get Single Product by ID (valid, invalid ID format 400, not found 404)
  {
    // Invalid ID format
    const reqBad = { params: { id: 'invalid-id' } };
    const resBad = createMockRes();
    await getProductById(reqBad, resBad);
    assert.strictEqual(resBad.statusCode, 400);

    // Non-existent ID
    const req404 = { params: { id: '000000000000000000000999' } };
    const res404 = createMockRes();
    await getProductById(req404, res404);
    assert.strictEqual(res404.statusCode, 404);

    // Valid existing ID
    const reqOk = { params: { id: createdProductId } };
    const resOk = createMockRes();
    await getProductById(reqOk, resOk);
    assert.strictEqual(resOk.statusCode, 200);
    assert.strictEqual(resOk.body.product.name, 'Mechanical Keyboard');
    console.log('✔ Test 22 Passed: Get Single Product handles valid ID, invalid ID (400), and not found (404)');
  }

  // ==========================================
  // LAB 04: WISHLIST FEATURE TESTS
  // ==========================================
  console.log('\n--- Starting ShopKart Wishlist Tests ---');
  const user = db.find((c) => c.email === 'john@gmail.com');
  const authReq = { user: { _id: user._id } };

  // Test 23: Add to wishlist - invalid product ID format -> 400
  {
    const req = { ...authReq, params: { productId: 'invalid-hex-id' } };
    const res = createMockRes();
    await addToWishlist(req, res);
    assert.strictEqual(res.statusCode, 400, 'Should return 400 on invalid product ID');
    console.log('✔ Test 23 Passed: Add to Wishlist returns 400 for malformed product ID');
  }

  // Test 24: Add to wishlist - non-existent product -> 404
  {
    const req = { ...authReq, params: { productId: '000000000000000000000999' } };
    const res = createMockRes();
    await addToWishlist(req, res);
    assert.strictEqual(res.statusCode, 404, 'Should return 404 when product is not found');
    console.log('✔ Test 24 Passed: Add to Wishlist returns 404 when product does not exist');
  }

  // Test 25: Add to wishlist - success -> 201
  {
    const req = { ...authReq, params: { productId: createdProductId } };
    const res = createMockRes();
    await addToWishlist(req, res);
    assert.strictEqual(res.statusCode, 201, 'Should return 201 on success');
    assert.strictEqual(res.body.success, true);
    assert.ok(user.wishlist.includes(createdProductId), 'Product reference must be stored in user wishlist');
    console.log('✔ Test 25 Passed: Add to Wishlist succeeds (201) and saves Product reference');
  }

  // Test 26: Add to wishlist - duplicate entry -> 409 Conflict
  {
    const req = { ...authReq, params: { productId: createdProductId } };
    const res = createMockRes();
    await addToWishlist(req, res);
    assert.strictEqual(res.statusCode, 409, 'Should return 409 Conflict for duplicate item');
    assert.strictEqual(res.body.success, false);
    console.log('✔ Test 26 Passed: Duplicate wishlist request prevented with 409 Conflict');
  }

  // Test 27: Get current user's wishlist -> 200 with populated product details
  {
    const req = { ...authReq };
    const res = createMockRes();
    await getWishlist(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.count, 1);
    assert.strictEqual(res.body.wishlist[0].name, 'Mechanical Keyboard');
    assert.strictEqual(res.body.wishlist[0].price, 2999);
    console.log('✔ Test 27 Passed: Get Wishlist returns populated products and count for authenticated user');
  }

  // Test 28: Remove from wishlist - invalid product ID format -> 400
  {
    const req = { ...authReq, params: { productId: 'invalid-hex-id' } };
    const res = createMockRes();
    await removeFromWishlist(req, res);
    assert.strictEqual(res.statusCode, 400);
    console.log('✔ Test 28 Passed: Remove from Wishlist returns 400 for malformed product ID');
  }

  // Test 29: Remove from wishlist - product not in wishlist -> 404
  {
    const req = { ...authReq, params: { productId: '000000000000000000000999' } };
    const res = createMockRes();
    await removeFromWishlist(req, res);
    assert.strictEqual(res.statusCode, 404);
    console.log('✔ Test 29 Passed: Remove from Wishlist returns 404 for item not in wishlist');
  }

  // Test 30: Remove from wishlist - success -> 200
  {
    const req = { ...authReq, params: { productId: createdProductId } };
    const res = createMockRes();
    await removeFromWishlist(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(user.wishlist.length, 0);
    console.log('✔ Test 30 Passed: Remove from Wishlist succeeds (200) and cleans user array');
  }

  // Test 31: Bonus Challenge - Wishlist Toggle Action (saved: true then saved: false)
  {
    // Toggle ON
    const reqOn = { ...authReq, params: { productId: createdProductId } };
    const resOn = createMockRes();
    await toggleWishlist(reqOn, resOn);
    assert.strictEqual(resOn.statusCode, 200);
    assert.strictEqual(resOn.body.saved, true);
    assert.strictEqual(user.wishlist.length, 1);

    // Toggle OFF
    const reqOff = { ...authReq, params: { productId: createdProductId } };
    const resOff = createMockRes();
    await toggleWishlist(reqOff, resOff);
    assert.strictEqual(resOff.statusCode, 200);
    assert.strictEqual(resOff.body.saved, false);
    assert.strictEqual(user.wishlist.length, 0);
    console.log('✔ Test 31 Passed: Bonus Wishlist Toggle flips saved status accurately');
  }

  // Test 32: Bonus Challenge - Wishlist Count
  {
    const req = { ...authReq };
    const res = createMockRes();
    await getWishlistCount(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.count, 0);
    console.log('✔ Test 32 Passed: Bonus Wishlist Count returns accurate count');
  }

  console.log('\n==========================================');
  console.log('All 32/32 Labs 01 + 03 + 04 Tests PASSED! 🎉');
  console.log('==========================================\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
