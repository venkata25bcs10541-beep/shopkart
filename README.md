# ShopKart — Fullstack E-Commerce Platform

A production-grade, modular e-commerce application built across three engineering labs:
- **Lab 01 (Backend):** Customer Authentication Service (Express, MongoDB, Mongoose, bcrypt, JWT, HttpOnly cookies, MVC).
- **Lab 02 (Frontend):** Customer Auth UI (React 19, React Router v7, Axios, Tailwind CSS v4, Lucide Icons, HttpOnly cookies).
- **Lab 03 (Fullstack):** Product Catalog & Discovery (Mongoose schema, REST APIs, dynamic querying, search, category filter, price sorting, dynamic detail pages, loading/empty/error states).

---

## 📁 Repository Structure

```text
shopkart/
├── ShopKart_API_Collection.postman_collection.json
├── package.json
├── README.md
├── backend/
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   └── product.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── customer.model.js
│   │   └── product.model.js
│   ├── routes/
│   │   ├── customer.routes.js
│   │   └── product.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env
│   ├── .env.example
│   ├── index.js
│   ├── package.json
│   ├── seed.js
│   └── test.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   └── SearchBar.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── ProductDetails.jsx
    │   │   ├── Products.jsx
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

## 🚀 Quick Start Guide

### 1. Database Setup & Seeding
Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017/shopkart`) or update `MONGO_URI` in `backend/.env`.

Populate the database with realistic products across all categories (Electronics, Fashion, Books, Home):
```bash
# From root directory:
npm run seed

# Or inside backend:
cd backend && npm run seed
```

### 2. Run Backend (Port 5000)
```bash
cd backend
npm run dev
```

### 3. Run Frontend (Port 5173)
In another terminal:
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173/products`** in your browser.

### 4. Run Automated Test Suite (22/22 Tests Passing)
```bash
npm test
```

---

## 🛒 Lab 03: Product Catalog & Discovery Architecture

### Backend Product APIs

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/products` | Create a new product with validation (`price > 0`, `stock >= 0`, all mandatory fields). Returns `201 Created`. |
| `GET` | `/products` | Get all products with dynamic filtering: `?search=...`, `?category=...`, and bonus `?sort=price_asc\|price_desc`. |
| `GET` | `/products/:id` | Get single product by MongoDB ObjectId. Validates ID format (`400`) and existence (`404`). |

#### Query Parameters Examples:
- **Search by Name (case-insensitive):** `GET /products?search=keyboard`
- **Category Filter:** `GET /products?category=Electronics`
- **Combined Search & Category:** `GET /products?search=keyboard&category=Electronics`
- **🌟 Bonus Challenge (+10 Marks) Price Sorting:**
  - Low to High: `GET /products?sort=price_asc`
  - High to Low: `GET /products?sort=price_desc`

---

### Frontend Product Discovery Pages & Components

- **[`/products`](file:///c:/Users/kurra/Downloads/shopkart/frontend/src/pages/Products.jsx) (Product Listing Page):**
  - Dynamically fetches product data using `getProducts()` in `api.js`.
  - Debounced search query triggers backend MongoDB regex matching.
  - Category selector filters by `Electronics`, `Fashion`, `Books`, and `Home`.
  - Bonus price sorter toggles between Ascending and Descending.
  - **State Handling:**
    - **Loading State:** Animated spinner and `"Loading products..."` banner.
    - **Error State:** Error banner `"Something went wrong while loading products."` with a **Retry Connection** button.
    - **Empty State:** `"No products found."` with **Clear All Filters** action.
- **[`ProductCard.jsx`](file:///c:/Users/kurra/Downloads/shopkart/frontend/src/components/ProductCard.jsx):**
  - High-resolution image with fallback error handler.
  - Formatted price in INR (`₹2,999`).
  - Category pill badge.
  - Stock availability status badge (`In Stock`, `Only X left`, or `Out of Stock`).
  - "View Details" button linking to `/products/:id`.
- **[`/products/:id`](file:///c:/Users/kurra/Downloads/shopkart/frontend/src/pages/ProductDetails.jsx) (Product Details Page):**
  - Extracts route ID parameter via React Router's `useParams()`.
  - Fetches product using `getProductById(id)`.
  - Renders large hero image, breadcrumb navigation, full description, availability, and taxes disclaimer.
  - Interactive **Quantity Selector** bounded by stock limits.
  - **Add to Cart** button with interactive toast confirmation.

---

## 🎓 Lab 03 TA Viva Questions & Complete Answers (Full Marks)

### Q1: Why should product data come from MongoDB instead of being hardcoded in React?
> **Answer:**
> - **Single Source of Truth:** Storing products in a centralized database ensures all users, microservices, mobile apps, and administrative panels view identical, synchronized data.
> - **Dynamic Mutation & Real-Time Accuracy:** Stock levels change with every purchase. Hardcoded data cannot reflect real-time inventory updates, price adjustments, or new product launches without redeploying the frontend.
> - **Scalability & Security:** An e-commerce store with millions of SKUs cannot load its entire inventory into browser memory. Storing data in MongoDB allows indexed querying, pagination, aggregation, and filtering directly at the database layer.

### Q2: What is the difference between a URL parameter and a query parameter?
> **Answer:**
> - **URL Parameter (Route Parameter):** Embedded directly into the path to uniquely identify a specific resource.
>   - *Syntax:* `/products/:id` (e.g., `/products/66d123abc456`)
>   - *Use Case:* Fetching an exact document or entity.
> - **Query Parameter:** Appended to the URL following a `?` symbol as key-value pairs separated by `&`.
>   - *Syntax:* `/products?category=Electronics&sort=price_asc`
>   - *Use Case:* Modifying, filtering, sorting, or paginating a collection of resources without changing the underlying resource route.

### Q3: When would you use `/products/:id` vs `/products?category=Electronics`?
> **Answer:**
> - Use `/products/:id` when retrieving a **single, discrete resource** by its unique identifier (e.g., viewing a specific product's detail page).
> - Use `/products?category=Electronics` when retrieving a **filtered subset of a collection** where multiple items match the criteria (e.g., browsing the electronics aisle).

### Q4: How does `.map()` help us render products dynamically?
> **Answer:**
> `.map()` is a declarative array transformation method. In React, it iterates over the products array returned from the API and transforms each raw JSON object into a JSX component instance (e.g., `<ProductCard key={product._id} product={product} />`). By pairing `.map()` with a unique `key` prop, React efficiently tracks changes, re-orders elements, and updates the virtual DOM with minimal overhead.

### Q5: Why do we need loading and error states in a frontend application?
> **Answer:**
> - **Asynchronous Nature of Network Requests:** Network requests take unpredictable time to complete. Without a loading state, users experience an unresponsive blank screen or broken UI layout, leading to confusion and duplicate actions.
> - **Fault Tolerance & User Experience (UX):** Network errors, offline connectivity, or server downtime are inevitable. An explicit error state informs the user what went wrong and provides recovery actions (e.g., a "Retry Connection" button).

### Q6: What happens when the backend returns an empty array?
> **Answer:**
> When the backend returns an empty array (`[]`) (for instance, when search keywords or category filters match no products), the HTTP status is still `200 OK`.
> In the frontend, an unhandled empty array would simply render nothing, giving the appearance of a broken or frozen page. Implementing an explicit **Empty State** (`products.length === 0`) allows us to render helpful feedback (`"No products found."`) along with actionable remedies such as a `"Clear All Filters"` button.

### Q7: Why should search/filtering be handled by the backend instead of filtering a huge dataset only in React?
> **Answer:**
> 1. **Network Bandwidth:** Fetching millions of products to the client to filter locally consumes gigabytes of mobile data and causes extreme network latency.
> 2. **Client Performance & Memory:** Processing, storing, and filtering large arrays in browser JavaScript causes UI thread blocking, lag, and potential browser tab crashes on mobile devices.
> 3. **Database Indexing:** Databases like MongoDB use B-Tree and text indexes to evaluate filters and search queries in milliseconds across millions of records, returning only the requested slice of data.

### Q8: Why should API/service logic be separated from UI components?
> **Answer:**
> - **Separation of Concerns (SoC):** UI components should focus purely on rendering view state and handling user events, not configuring HTTP headers or parsing raw error response formats.
> - **Maintainability & Reusability:** If API endpoints, base URLs, or authentication headers change, edits are made in a single centralized file (`services/api.js`) without altering dozens of component files.
> - **Testability:** Decoupled service modules can easily be mocked or unit-tested independently from React component lifecycle hooks.

---

## 🎓 Lab 02 TA Viva Questions & Answers

1. **Why do we use `withCredentials: true`?**
   > By default, browsers do not attach cookies to cross-origin AJAX requests (`CORS`). Setting `withCredentials: true` on Axios tells the browser to include the HttpOnly authentication cookie in requests to `http://localhost:5000` and store server `Set-Cookie` responses.
2. **Why can't JavaScript read an HttpOnly cookie?**
   > The `HttpOnly` flag prevents client-side scripts from reading the cookie via `document.cookie`, providing defense-in-depth against session hijacking via Cross-Site Scripting (XSS).
3. **Why is `/home` called a protected route?**
   > Because it requires a verified session. The component fetches `GET /customers/me` on mount; if unauthenticated, the user is immediately redirected to `/login`.
4. **Why do we fetch `/customers/me` instead of storing the user manually?**
   > To guarantee that the authenticated identity is verified against the database and prevent storing sensitive credentials in vulnerable client-side storage (`localStorage`).
5. **Difference between authentication and authorization?**
   > **Authentication** verifies *who you are* (identity). **Authorization** determines *what you are allowed to do* (access privileges).

---

## 🎓 Lab 01 TA Viva Questions & Answers

1. **Why use bcrypt over encryption?**
   > Encryption is two-way and reversible with a key. Bcrypt is a one-way cryptographic hash with salting and an adjustable work factor, preventing decryption and rainbow table attacks.
2. **What information is stored inside a JWT payload?**
   > Non-sensitive claims like customer ID (`id`), issuance time (`iat`), and expiration time (`exp`). Passwords and secrets must never be placed inside a JWT payload.
3. **Why is the HttpOnly flag important?**
   > Protects the cookie from access via client JavaScript, stopping token theft through XSS.
4. **Why should passwords never be returned to frontend?**
   > Exposing hashes creates opportunities for offline cracking and leaks sensitive information to browser caches and logs.
5. **Purpose of authentication middleware?**
   > Extracts and verifies the token, validates user existence in the database, attaches the user to `req.user`, and blocks unauthenticated requests with `401 Unauthorized`.
