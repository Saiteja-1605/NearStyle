# NearStyle

> **"Discover Nearby. Try Before You Buy."**

NearStyle is a full-stack, hyper-local fashion marketplace that bridges the gap between digital e-commerce discovery and physical brick-and-mortar fashion stores.

Customers can discover independent fashion boutiques within their immediate neighborhood, browse real-time inventory across multiple stores, and use the signature **Reserve & Try** engine to hold an outfit for **8 hours** to try on physically in the dressing room before purchasing.

---

## 🌟 Key Links & Placeholders

* **Live Frontend URL**: *[Deploy via Render Static Site - Placeholder]*
* **Live Backend REST API**: *[Deploy via Render Web Service - Placeholder]*
* **API Health Check**: `https://<your-backend-url>.onrender.com/api/health`
* **GitHub Repository**: *[https://github.com/<your-username>/nearstyle]*

---

## 💎 Flagship Differentiating Feature: Reserve & Try

1. **Find & Reserve Online**: A customer selects any in-stock item and clicks **Reserve & Try**.
2. **Atomic Inventory Locking**: The backend atomically locks the item (`sizes.reserved` increments by 1), preventing double-booking or overselling.
3. **8-Hour Expiry Window**: The store holds the item physically for exactly 8 hours. An on-demand and background cron cleaner monitors deadline expirations.
4. **Physical Store Visit**: The customer visits the store and shows their verification code (`NS-RES-XXXXX`).
5. **Resolution**:
   * **Purchased**: The shopkeeper marks the item as purchased in their portal; physical inventory is permanently decremented.
   * **Cancelled**: The customer or shopkeeper cancels the hold; stock immediately unlocks.
   * **Expired**: If 8 hours pass without action, the reservation automatically lapses and stock returns to available.

---

## 👥 Multi-Role User Features

### 🛍️ Customer Experience
* **Location & Proximity**: Select City & Area (e.g., Bandra, Mumbai) or use browser GPS to calculate exact approximate distance in kilometers.
* **Store Discovery**: Explore physical fashion boutiques with operational hours, ratings, addresses, and directions.
* **Cross-Store Catalog**: Unified search across multiple local shops by name, brand, category, and color.
* **Multi-Filtering & Sorting**: Filter by price range, size (XS–XXL), color, max distance radius, and in-stock availability.
* **Persistent Wishlist**: Save favourite styles directly to MongoDB.
* **Cart & Checkout**: Size and color selection with real-time stock bounds checking. Supports **Home Delivery** and **Store Pickup**.
* **Order Tracking & Return Requests**: Order lifecycle tracking with built-in return request workflows (e.g. *Doesn't fit*, *Damaged*).
* **Customer Reviews**: Rate (1–5 stars) and comment on products.
* **In-App Notifications**: Real-time alerts for order progress and reservation expiry countdowns.

### 🏪 Shopkeeper Merchant Experience
* **Streamlined Dashboard**: 5 key metric cards: Today's Sales, Today's Orders, Active Reservations, Total Products, and Low Stock Alerts.
* **Store Profile Management**: Set trade name, address, operating hours, categories, storefront banner, and Reserve & Try toggles.
* **Add & Edit Products**: Rapid publishing form with multi-size selection, per-size stock allocation, and color tags.
* **Quick Inventory Updater**: Dedicated fast-operation view with inline `[+]` and `[-]` stepper buttons and one-click visibility toggles without opening full forms.
* **Order Management**: Multi-tab order manager (`Placed`, `Confirmed`, `Preparing`, `Ready`, `Delivered`, `Cancelled`) with single-click status progression.
* **Reservation Verification**: Search and verify customer reservation codes (`NS-RES-XXXXX`) and complete purchases.
* **Store Analytics & Trend Insights**: Sales reports and platform-wide market trend intelligence (top demanded sizes, colors, and price points).

### 🛡️ Admin Governance
* **Platform Health & Metrics**: Overview of total customers, stores, active products, orders, reservations, and gross platform revenue.
* **Store Approval Queue**: Review newly registered stores (`PENDING` → `APPROVED` / `REJECTED` / `SUSPENDED`).
* **User & Transaction Audits**: Full directory of users and orders.

---

## 🔑 Pre-Seeded Demo Accounts

NearStyle provides pre-seeded accounts for effortless testing and academic evaluation. You can also click the **"Quick Demo Sign-In"** buttons in the navigation bar.

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `demo.customer@nearstyle.com` | `Demo@123` | Pre-loaded with Bandra address and active orders |
| **Shopkeeper** | `demo.shopkeeper@nearstyle.com` | `Demo@123` | Owner of **Fashion Hub** with full inventory & reservations |
| **Admin** | `demo.admin@nearstyle.com` | `Demo@123` | Full administrative moderation access |

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Axios, React Router 7.
* **Backend**: Node.js, Express.js, TypeScript, Mongoose ODM, JWT, bcryptjs, CORS.
* **Database**: MongoDB Atlas (with geospatial 2dsphere indexing and compound query indexes).
* **Deployment Target**: Render Static Site (Frontend) + Render Web Service (Backend).

---

## 📁 Repository Structure

```text
nearstyle/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection & env validation
│   │   ├── controllers/        # Business logic for all 11 modules
│   │   ├── middleware/         # JWT authentication, role guards, errorHandler
│   │   ├── models/             # User, Store, Product, Order, Reservation, Review, Notification, Wishlist
│   │   ├── routes/             # REST API routers
│   │   ├── seed/               # Realistic dataset (6 stores, 40+ products, demo accounts)
│   │   ├── tests/              # Automated Reserve & Try integration tests (Scenarios A-D)
│   │   ├── utils/              # Haversine distance, code generator, reservation expiry
│   │   └── server.ts           # Express server entry point & background cron
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Common, Customer, and Shopkeeper UI components
│   │   ├── context/            # Auth, Cart, Wishlist, Location, Toast contexts
│   │   ├── hooks/              # useCountdown (8h timer), useDebounce
│   │   ├── pages/              # Customer, Shopkeeper, Admin, and Auth views
│   │   ├── services/           # Axios API service
│   │   ├── types/              # Comprehensive TypeScript interfaces
│   │   ├── App.tsx             # Route declarations
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── render.yaml                 # Render Blueprint for automated cloud deployment
├── package.json                # Monorepo scripts
└── README.md
```

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)
* **MongoDB** (Local instance or free MongoDB Atlas cluster)

### 1. Clone the repository
```bash
git clone https://github.com/Saiteja-1605/NearStyle.git
cd nearstyle
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/nearstyle
JWT_SECRET=nearstyle_super_secret_jwt_key_college_project_2025
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
# Leave blank for local Vite proxying to localhost:5000
VITE_API_URL=
```

### 4. Seed the Database
Populate 6 realistic stores, 40+ fashion items, and the 3 demo accounts:
```bash
npm run seed
```

### 5. Run the Automated Tests
Verify all 4 core Reserve & Try scenarios (Atomic Locking, Expiry, Cancellation, Purchase):
```bash
npm run test:backend
```

### 6. Start the Development Servers
In separate terminals:
```bash
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Frontend App
npm run dev:frontend
```
Open **`http://localhost:5173`** in your browser.

---

## 🚀 Deployment Guide on Render

### Step 1: Push Project to GitHub
```bash
git init
git add .
git commit -m "Initial commit of NearStyle complete marketplace"
git branch -M main
git remote add origin https://github.com/Saiteja-1605/NearStyle.git
git push -u origin main
```

### Step 2: Set Up MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with password.
3. In Network Access, allow access from anywhere (`0.0.0.0/0`).
4. Copy your connection string: `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/nearstyle?retryWrites=true&w=majority`.

### Step 3: Deploy via Render Blueprint (One-Click)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will read `render.yaml` and configure:
   * **`nearstyle-backend`** (Web Service):
     * Root Directory: `backend`
     * Build: `npm install && npm run build`
     * Start: `npm start`
     * Set environment variable `MONGO_URI` to your MongoDB Atlas string.
   * **`nearstyle-frontend`** (Static Site):
     * Root Directory: `frontend`
     * Build: `npm install && npm run build`
     * Publish Directory: `dist`
     * Render automatically links `VITE_API_URL` to the backend service URL!

---

## 🧪 Testing Scenarios Verification Matrix

The Reserve & Try engine has been explicitly verified for all college evaluation criteria:

* **Scenario A (Overselling Prevention)**: When unit stock = 1 and Customer A reserves, Customer B receives a `400 Out of Stock` error.
* **Scenario B (Auto-Expiry)**: Expired reservations trigger automatic stock restoration back to available inventory.
* **Scenario C (Customer Cancellation)**: Cancelling an active hold releases locked inventory immediately.
* **Scenario D (In-Store Purchase)**: In-store completion permanently decreases physical inventory and clears the hold.

---

## 📄 License
This project is submitted as an academic full-stack capstone project under the MIT License.
