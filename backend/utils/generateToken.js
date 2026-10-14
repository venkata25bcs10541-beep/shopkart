const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a customer and sets it as an HttpOnly cookie.
 * Can be called as:
 *   generateToken(res, customerId) -> sets cookie and returns token
 *   generateToken(customerId)      -> returns token
 *
 * @param {object|string} resOrId - Express response object or customer ID
 * @param {string} [id] - Customer ID (if first argument is res)
 * @returns {string} token - The signed JWT string
 */
const generateToken = (resOrId, id) => {
  let customerId;
  let res = null;

  if (resOrId && typeof resOrId.cookie === 'function') {
    res = resOrId;
    customerId = id;
  } else {
    customerId = resOrId;
  }

  const token = jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET || 'shopkart_default_secret_key',
    { expiresIn: '7d' }
  );

  if (res) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  return token;
};

module.exports = generateToken;
