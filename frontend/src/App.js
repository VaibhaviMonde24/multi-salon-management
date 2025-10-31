import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Appointments from "./pages/customer/Appointments";
import BookAppointment from "./pages/customer/BookAppointment";
import Notifications from "./pages/customer/Notifications";
import Reviews from "./pages/customer/Reviews";
import Profile from "./pages/customer/Profile";
import Payments from "./pages/customer/Payments";

// Owner pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerAppointments from "./pages/owner/OwnerAppointments";
import OwnerSalons from "./pages/owner/OwnerSalons";
import OwnerPayments from "./pages/owner/OwnerPayments";
import OwnerReviews from "./pages/owner/OwnerReviews";
import OwnerBranches from "./pages/owner/OwnerBranches";
import OwnerStaff from "./pages/owner/OwnerStaff";
import OwnerServices from "./pages/owner/OwnerServices";
import OwnerInventory from "./pages/owner/OwnerInventory";
import OwnerNotifications from "./pages/owner/OwnerNotifications";
import OwnerReports from "./pages/owner/OwnerReports";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSalons from "./pages/admin/AdminSalons";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminContact from "./pages/admin/AdminContact";
// Optional: 404 page
import NotFound from "./pages/NotFound"; // create this if you like
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Customer routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/appointments" element={<Appointments />} />
        <Route path="/customer/book-appointment" element={<BookAppointment />} />
        <Route path="/customer/notifications" element={<Notifications />} />
        <Route path="/customer/payments" element={<Payments/>}/>
        <Route path="/customer/reviews" element={<Reviews />} />
        <Route path="/customer/profile" element={<Profile />} />

        {/* Owner routes */}
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/appointments" element={<OwnerAppointments />} />
        <Route path="/owner/salons" element={<OwnerSalons />} />
        <Route path="/owner/payments" element={<OwnerPayments />} />
        <Route path="/owner/reviews" element={<OwnerReviews />} />
        <Route path="/owner/branches" element={<OwnerBranches />} />
        <Route path="/owner/staff" element={<OwnerStaff />} />
        <Route path="/owner/services" element={<OwnerServices />} />
        <Route path="/owner/inventory" element={<OwnerInventory />} />
        <Route path="/owner/notifications" element={<OwnerNotifications />} />
        <Route path="/owner/reports" element={<OwnerReports />} />

         {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/salons" element={<AdminSalons />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/contacts" element={<AdminContact />} />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
