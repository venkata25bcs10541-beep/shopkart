# ShopKart — Fullstack Customer Authentication System

A complete, production-grade Customer Authentication System built for **ShopKart**:
- **Lab 01 (Backend):** Express, MongoDB, Mongoose, bcrypt, JWT & HttpOnly cookies following MVC architecture.
- **Lab 02 (Frontend):** React 19, React Router v7, Axios, Tailwind CSS v4, Lucide Icons, and HttpOnly cookie integration (`withCredentials: true`).

---

## 📁 Repository Structure

```text
shopkart/
├── ShopKart_Customer_Auth_API.postman_collection.json
├── package.json
├── README.md
├── backend/
│   ├── controllers/
│   │   └── customer.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── customer.model.js
│   ├── routes/
│   │   └── customer.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env
│   ├── .env.example
│   ├── index.js
│   ├── package.json
│   └── test.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚡ Quick Start (Running Both Backend & Frontend)

### 1. Start MongoDB
Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017/shopkart`) or set your Atlas URI in `backend/.env`.

### 2. Start Backend (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 3. Start Frontend (Port 5173)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

## 🎨 Lab 02: Frontend Features & Implementation

### Task 1 — Registration Page (`/register`) [25 Marks]
- Form fields: **Full Name**, **Email**, **Password**, **Phone Number**, and **Create Account Button**.
- **Controlled Components:** Every input binds to React state (`formData`) with synchronized `onChange` handlers.
- **Client & Server Validation:** Validates mandatory fields, email regex format, and minimum 6-character password. Server errors (such as `409 Email already exists`) are displayed in alert banners.
- **Success Transition:** Displays success state and navigates to `/login` via React Router.

### Task 2 — Login Page (`/login`) [30 Marks]
- Form fields: **Email**, **Password**, and **Login Button**.
- **HttpOnly Cookie Integration:** Dispatches `POST /customers/login` with `withCredentials: true` via Axios so the browser automatically persists the JWT cookie.
- **Error Handling:** Renders clear `"Invalid credentials"` notification on authentication failure without leaking account existence.
- **Success Navigation:** Automatically redirects authenticated customer to `/home`.

### Task 3 — Protected Home Page (`/home`) [30 Marks]
- Accessible only to authenticated customers.
- Dispatches `GET /customers/me` with `withCredentials: true` on component mount to retrieve authenticated profile details from MongoDB.
- If unauthorized (missing/expired cookie), automatically redirects to `/login`.
- Displays:
  - Welcome banner with customer name.
  - Verified details: Full Name, Email, and Phone Number.
  - ShopKart e-commerce overview cards (Cart, Orders, Wishlist, Wallet).
  - Built-in Change Password modal (Bonus Challenge).

### Task 4 — Logout Flow [15 Marks]
- Integrated directly in the persistent [`Navbar`](file:///c:/Users/kurra/Downloads/shopkart/frontend/src/components/Navbar.jsx).
- Invokes `POST /customers/logout` to clear the HttpOnly authentication cookie.
- Clears local customer state and redirects to `/login`.

---

## 🧪 Testing Backend APIs (Lab 01)

Run the automated backend test suite (13/13 passing tests):
```bash
npm test
```

Or import `ShopKart_Customer_Auth_API.postman_collection.json` into Postman to run tests against the live server.

---

## 🎓 Lab 02 TA Viva Questions & Complete Answers (Full Marks)

### Q1: Why do we use `withCredentials: true`?
> **Answer:**
> By default, browser security restrictions prevent cross-origin HTTP requests from sending or receiving credentials (such as cookies, HTTP authentication headers, or TLS client certificates).
> Setting `withCredentials: true` on our Axios instance instructs the browser:
> 1. To attach existing cookies (including our `token` HttpOnly cookie) to outgoing cross-origin requests made to `http://localhost:5000`.
> 2. To accept and store any `Set-Cookie` headers returned by the server.
> Without this flag, the authentication cookie set on login would never be forwarded to `/customers/me`, making session maintenance impossible.

### Q2: Why can't JavaScript read an HttpOnly cookie?
> **Answer:**
> The `HttpOnly` attribute is a protective flag set by the server on the `Set-Cookie` header. When present, the browser prohibits client-side scripts from accessing that cookie through properties like `document.cookie`.
> This is a crucial security barrier against **Cross-Site Scripting (XSS)** attacks: even if malicious third-party script or an injected script runs on the web application, it cannot steal the customer's session token or impersonate the user.

### Q3: Why is `/home` called a protected route?
> **Answer:**
> `/home` is called a protected route because it is restricted to authenticated users. Unauthenticated visitors are not allowed to view the route.
> When a user navigates to `/home`, the application verifies authentication status by querying the backend endpoint `GET /customers/me`. If no valid JWT cookie is present, or if token verification fails with a `401 Unauthorized` status, access is denied and the user is immediately redirected to `/login`.

### Q4: Why do we fetch `/customers/me` instead of storing the user manually?
> **Answer:**
> 1. **Single Source of Truth:** Storing user information manually in frontend `localStorage` or `sessionStorage` can easily become stale or manipulated by the client. Fetching `/customers/me` verifies that the session token is genuine and active in the database at that exact moment.
> 2. **Security:** `localStorage` is vulnerable to XSS data theft. By relying on server-side token validation and querying `/customers/me`, sensitive account metadata remains protected and tamper-proof.
> 3. **Instant Invalidation:** If an administrator suspends an account or a user changes their password on another device, `/customers/me` will immediately reject invalid requests.

### Q5: What is the difference between authentication and authorization?
> **Answer:**
> - **Authentication (AuthN):** The process of verifying **who** the user is (verifying identity). Examples: checking email and password during `POST /customers/login`, or validating a signed JWT.
> - **Authorization (AuthZ):** The process of verifying **what permissions** an authenticated user has (verifying access rights). Examples: determining whether an authenticated customer can access an admin dashboard, edit another user's profile, or modify product inventories.

---

## 🎓 Lab 01 TA Viva Questions & Answers

### Q1: Why do we use **bcrypt** instead of encrypting passwords?
> **Answer:**
> Encryption is two-way: if an attacker obtains the encryption key, every password can be decrypted back to plaintext. Bcrypt is a one-way mathematical hashing algorithm with a salt and configurable work factor (key stretching), making it mathematically irreversible and resistant to brute-force and rainbow table attacks.

### Q2: What information is typically stored inside a JWT payload?
> **Answer:**
> Non-sensitive claims such as user ID (`id`), token issuance time (`iat`), expiration time (`exp`), and optional roles/permissions. Sensitive information like plaintext passwords or credit card numbers must never be included because JWT payloads are merely base64url-encoded.

### Q3: Why is the **HttpOnly** flag important for cookies?
> **Answer:**
> It prevents JavaScript from accessing the cookie via `document.cookie`, mitigating token theft from Cross-Site Scripting (XSS) vulnerabilities.

### Q4: Why should passwords never be returned to the frontend?
> **Answer:**
> Returning password hashes exposes them to browser history, network logging tools, and client-side stores, giving attackers opportunity for offline dictionary and brute-force cracking. The frontend UI only needs profile identity fields (`fullName`, `email`, `phone`).

### Q5: What is the purpose of authentication middleware?
> **Answer:**
> It acts as a gatekeeper in the request pipeline: extracting the token, verifying its cryptographic signature and validity, retrieving the user from the database, and attaching the user object to `req.user` for protected route handlers.
