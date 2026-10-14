# ShopKart — Fullstack E-Commerce Platform

A production-grade, modular e-commerce application built across four engineering labs:
- **Lab 01 (Backend):** Customer Authentication Service (Express, MongoDB, Mongoose, bcrypt, JWT, HttpOnly cookies, MVC).
- **Lab 02 (Frontend):** Customer Auth UI (React 19, React Router v7, Axios, Tailwind CSS v4, Lucide Icons, HttpOnly cookies).
- **Lab 03 (Fullstack):** Product Catalog & Discovery (Mongoose schema, REST APIs, dynamic querying, search, category filter, price sorting, dynamic detail pages, loading/empty/error states).
- **Lab 04 (Fullstack):** Customer Wishlist System (MongoDB relationships, ObjectId references, `ref: "Product"`, `populate()`, protected APIs, duplicate prevention, dynamic UI cards, loading/empty/error states, and Wishlist toggle).

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
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js           # [NEW] Add, Get, Remove, Toggle, Count
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── customer.model.js               # [UPDATED] Added wishlist ObjectId ref array
│   │   ├── user.model.js                   # Alias to customer.model.js
│   │   └── product.model.js
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   └── wishlist.routes.js              # [NEW] Protected /wishlist endpoints
│   ├── seed.js
│   ├── test.js                             # [UPDATED] 32/32 Passing Unit & Integration Tests
│   └── index.js                            # [UPDATED] Mounted /wishlist
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx                  # [UPDATED] Added Wishlist navigation link
    │   │   ├── ProductCard.jsx             # [UPDATED] In-progress & toggle Wishlist button
    │   │   ├── SearchBar.jsx
    │   │   └── WishlistCard.jsx            # [NEW] Dedicated Wishlist Card with Remove action
    │   ├── pages/
    │   │   ├── Home.jsx                    # [UPDATED] Linked to Wishlist page
    │   │   ├── Login.jsx
    │   │   ├── ProductDetails.jsx          # [UPDATED] Wishlist button in details view
    │   │   ├── Products.jsx
    │   │   ├── Register.jsx
    │   │   └── Wishlist.jsx                # [NEW] /wishlist with Loading, Empty & Error states
    │   ├── services/
    │   │   └── api.js                      # [UPDATED] Wishlist API service methods
    │   ├── App.jsx                         # [UPDATED] Registered /wishlist route
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js                      # [UPDATED] Proxies /customers, /products, /wishlist
```

---

## ⚡ Quick Start Guide

### 1. Database Setup & Seeding
Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017/shopkart`) or configure `MONGO_URI` in `backend/.env`.

Populate the product catalog:
```bash
npm run seed
```

### 2. Run Backend (Port 5000)
```bash
npm run dev:backend
```

### 3. Run Frontend (Port 5173)
In another terminal:
```bash
npm run dev:frontend
```
Open **`http://localhost:5173/products`** in your browser.

### 4. Run Automated Test Suite (32/32 Tests Passing)
```bash
npm test
```

---

## 🛍️ Lab 04: Wishlist Feature Architecture

### Database Relationship
The relationship between Customer and Product is modeled via **referencing** (not embedding) to preserve Product as the single source of truth for pricing, images, and live inventory.

```text
User / Customer Schema
└── wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ]
```

---

### Backend Wishlist APIs

All wishlist endpoints are **protected** by `authMiddleware` via JWT cookies or Bearer tokens. The user identity is extracted securely from `req.user._id` without accepting `userId` from the request body.

| Method | Endpoint | Auth | Description | Status Codes |
|:---|:---|:---:|:---|:---|
| `POST` | `/wishlist/:productId` | ✅ | Adds a product reference to current user's wishlist. Prevents duplicates. | `201 Created`<br>`400 Invalid ID`<br>`401 Unauthorized`<br>`404 Not Found`<br>`409 Conflict` |
| `GET` | `/wishlist` | ✅ | Returns current user's wishlist populated with product details (`name`, `price`, `category`, `image`, `stock`). | `200 OK`<br>`401 Unauthorized` |
| `DELETE` | `/wishlist/:productId` | ✅ | Removes a product reference from the user's wishlist array. | `200 OK`<br>`400 Invalid ID`<br>`401 Unauthorized`<br>`404 Not in wishlist` |
| `PATCH` | `/wishlist/:productId/toggle` | ✅ | **🌟 Bonus (+10 Marks):** Toggles wishlist status (`saved: true/false`). | `200 OK`<br>`400 Invalid ID`<br>`404 Not Found` |
| `GET` | `/wishlist/count` | ✅ | **🌟 Bonus (+5 Marks):** Returns current user's saved wishlist count. | `200 OK`<br>`401 Unauthorized` |

---

### Frontend Wishlist User Experience

1. **[`ProductCard.jsx`](file:///c:/Users/kurra/Downloads/shopkart/frontend/src/components/ProductCard.jsx):**
   - Quick floating heart button on product image and `[ ♡ Wishlist ]` bottom action.
   - **Request In Progress:** Displays `⏳ Saving...` spinner and disables button to prevent duplicate clicks.
   - **Success State:** Displays filled red heart `♥ Added to Wishlist` with instant visual confirmation.
   - **Error Handling:** Shows clear feedback toast if network fails or redirects to `/login` if unauthenticated.
2. **[`WishlistCard.jsx`](file:///c:/Users/kurra/Downloads/shopkart/frontend/src/components/WishlistCard.jsx):**
   - Displays product image, name, INR price, category, and real-time stock badge.
   - Action buttons: `[ View Details ]` and `[ Remove from Wishlist ]`.
   - Removing triggers `DELETE /wishlist/:productId` and immediately updates the UI list without a full page refresh.
3. **[`/wishlist`](file:///c:/Users/kurra/Downloads/shopkart/frontend/src/pages/Wishlist.jsx) (Wishlist Page):**
   - **Loading State:** `Loading your wishlist...` with animated spinner.
   - **Empty State:** `❤️ Your wishlist is empty` with a call-to-action button `[ Browse Products ]` leading to `/products`.
   - **Error State:** `Unable to load wishlist.` with a `[ Try Again ]` retry handler.
4. **[`Navbar.jsx`](file:///c:/Users/kurra/Downloads/shopkart/frontend/src/components/Navbar.jsx):**
   - Main navigation: `Home | Products | Wishlist | Logout`.

---

## 🎓 Lab 04 TA Viva Questions & Answers (Full Marks)

### Database

#### Q1: Why are we storing ObjectIds instead of Product objects?
> **Answer:**
> - Storing product ObjectIds follows **data normalization (referencing)** instead of duplication (embedding).
> - The `Product` collection is the **single source of truth**. When a product's price, stock, description, or image changes, all wishlists automatically reflect the updated values via `populate()`. If we embedded entire product objects, the data would immediately become stale whenever inventory or prices fluctuated.

#### Q2: What does `ref: "Product"` do?
> **Answer:**
> - `ref: "Product"` instructs Mongoose which model to look up when resolving the `ObjectId`.
> - It enables Mongoose's `.populate()` method to automatically execute a secondary query against the `Product` collection and replace the raw `ObjectId` with the corresponding product document.

#### Q3: What is the difference between embedding and referencing?
> **Answer:**
> - **Embedding (Denormalization):** Documents are stored directly inside other documents (e.g., an address subdocument inside a user). Best for 1-to-few relationships where data is rarely updated independently and is always accessed together.
> - **Referencing (Normalization):** Storing only the `ObjectId` of another document in a different collection. Best for many-to-many or 1-to-many relationships where the referenced entity has an independent lifecycle, updates frequently, or is shared across multiple users (such as e-commerce products).

#### Q4: Why do we use `populate()`?
> **Answer:**
> - In MongoDB, relationships are not resolved automatically as in SQL `JOIN`s.
> - `populate()` is a Mongoose abstraction that performs a lookup query behind the scenes, matching the stored `ObjectId`s in the `wishlist` array to documents in the `Product` collection and replacing them with full product objects before returning the response.

---

### Backend

#### Q5: Why should wishlist endpoints be protected?
> **Answer:**
> - A customer's wishlist represents private, personalized user data.
> - Protecting the endpoints with authentication middleware prevents unauthorized users from reading another customer's saved items or modifying another user's wishlist.

#### Q6: Why should the server get the user ID from the JWT?
> **Answer:**
> - The JWT is cryptographically signed with the server's private secret (`JWT_SECRET`). Once validated, the claims inside (such as user `id`) are guaranteed to be authentic and tamper-proof.
> - This guarantees that the user identity is verified and cannot be forged.

#### Q7: Why should we not accept `userId` from the client?
> **Answer:**
> - Accepting `userId` from the request body or URL parameters introduces an **Insecure Direct Object Reference (IDOR)** vulnerability.
> - Any malicious user could pass another customer's `userId` in the payload and alter or view their wishlist. The server must strictly deduce user identity from the authenticated session (`req.user._id`).

#### Q8: How are duplicate wishlist entries prevented?
> **Answer:**
> - Before adding a product reference, the backend checks whether the user's `wishlist` array already contains the target `productId`:
>   ```javascript
>   const isAlreadyWishlisted = user.wishlist.some(id => id.toString() === productId);
>   ```
> - If found, the server halts execution immediately and returns an HTTP `409 Conflict` status code.

#### Q9: What HTTP status should be returned for a duplicate wishlist request?
> **Answer:**
> - **`409 Conflict`**: Indicates that the request cannot be completed because it conflicts with the current state of the resource (the product is already present in the user's wishlist).

---

### Frontend

#### Q10: Why should the Wishlist page fetch from the backend?
> **Answer:**
> - The backend MongoDB database is the persistent source of truth.
> - Fetching from the backend ensures that the customer's wishlist is preserved across different browser sessions, page reloads, and devices (e.g. browsing on desktop, purchasing on mobile).

#### Q11: Why do we need loading, error and empty states?
> **Answer:**
> - **Loading State:** Eliminates blank UI freezes while network I/O is in-flight.
> - **Error State:** Provides clear failure communication and a retry path if connectivity drops.
> - **Empty State:** Guides the user when their wishlist contains zero items, offering a clear call-to-action (`[ Browse Products ]`) to drive engagement.

#### Q12: Why should the wishlist survive a page refresh?
> **Answer:**
> - E-commerce customers expect persistent shopping intent. If saved items disappeared on browser refresh or navigation, it would frustrate users and severely damage conversion rates. By saving references in MongoDB tied to the authenticated user account, the wishlist remains intact indefinitely.
