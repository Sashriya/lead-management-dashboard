# Smart Leads Dashboard

A full-stack Lead Management Dashboard built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with TypeScript support. This application helps businesses manage customer leads efficiently with authentication, role-based access control, filtering, lead tracking, and CSV export functionality.

---

# Features

## Authentication & Authorization
- User Registration & Login
- JWT Authentication
- Role-Based Access Control (Admin / Sales)
- Protected Routes

## Lead Management
- Create New Leads
- View All Leads
- Get Lead By ID
- Update Leads
- Delete Leads
- Lead Status Tracking
- Lead Source Tracking

## Dashboard Features
- Lead Statistics
- Filtering & Searching
- Pagination
- CSV Export
- Responsive UI

## Security
- Password Hashing using bcrypt
- JWT Token Authentication
- Protected API Routes
- Express Rate Limiting
- Helmet Security Middleware

---

# Tech Stack

## Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hot Toast

## Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Express Validator

---

# Project Structure

```bash
smart-leads-dashboard/
│
├── client/                 # Frontend
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── context/
│
├── server/                 # Backend
│   ├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   └── utils/
│
└── README.md
