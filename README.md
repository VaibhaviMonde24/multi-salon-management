# 💇 SalonHub – Multi-Salon Management System

A full-stack web application that digitizes and streamlines salon operations including appointment booking, staff management, inventory tracking, and payment processing — all from a single platform with role-based access.

---

## 🚀 Features

### 👤 Role-Based Dashboards
- **Admin** – Manage all salons, users, and platform-level settings
- **Salon Owner** – Manage services, staff, appointments, inventory, and payments
- **Customer** – Browse salons, book appointments, view history, and leave reviews

### 📅 Appointment Management
- Book, reschedule, and cancel appointments
- Real-time availability tracking per salon and staff member

### 💰 Payment & Billing
- Track payments per appointment
- Payment status management (Pending / Paid / Cancelled)

### 🧴 Inventory Management
- Track salon products and stock levels
- Low stock alerts for salon owners

### ⭐ Reviews & Ratings
- Customers can rate and review salon services after appointments

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | ReactJS, HTML, CSS, Bootstrap       |
| Backend    | Node.js, Express.js                 |
| Database   | MySQL (12 tables)                   |
| API        | REST APIs                           |
| Testing    | Postman (API Testing), Manual Testing |
| Tools      | VS Code, Git, GitHub                |

---

## 🗄️ Database Design

The MySQL database consists of **12 tables** covering:
- Users (Admin, Salon Owner, Customer)
- Salons & Services
- Appointments
- Staff & Schedules
- Payments
- Inventory
- Reviews

---

## 📁 Project Structure

```
multi-salon-management/
├── frontend/          # ReactJS frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/  # API calls
├── backend/           # Node.js + Express backend
│   ├── routes/        # API route handlers
│   ├── controllers/
│   ├── models/        # MySQL queries
│   └── config/        # DB connection
├── Field_ProjectTYIT/ # Project documentation (ER diagram, UML, test cases)
└── README.md
```

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js (v16+)
- MySQL
- npm

### Backend Setup
```bash
cd backend
npm install
# Configure your MySQL credentials in config/db.js
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The app will run at `http://localhost:3000`

---

## 🧪 Testing

- **API Testing** – All REST endpoints tested using Postman
- **Manual Testing** – Documented test cases for all modules (Appointment, Payment, Inventory, Reviews)
- Test reports available in the `Field_ProjectTYIT/` folder

---

## 📄 Documentation

The `Field_ProjectTYIT/` folder includes:
- ER Diagram
- Use-Case Diagram
- Class Diagram
- Test Case Reports

---

## 👩‍💻 Developer

**Vaibhavi Suhas Monde**  
B.Sc. Information Technology – Gogate Jogalekar College, University of Mumbai (2026)  
📧 vaibhavimonde24@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/vaibhavi-monde-81b78528b)

---

## 📌 Note

This project was developed as a Final Year Field Project (TYIT) and represents a complete, independently built full-stack application.
