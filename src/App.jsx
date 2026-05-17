import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

// Citizen
import CitizenLayout from './layouts/CitizenLayout';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import RegisterComplaint from './pages/citizen/RegisterComplaint';
import Schemes from './pages/citizen/Schemes';
import Profile from './pages/citizen/Profile';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ComplaintsList from './pages/admin/ComplaintsList';
import Reports from './pages/admin/Reports';
import Chatbot from './components/Chatbot';
import ChatbotPage from './pages/citizen/ChatbotPage';

function App() {
  return (
    <Router>
      <Chatbot />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          {/* chatbot route moved to citizen routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Citizen Routes */}
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CitizenDashboard />} />
          <Route path="complaint" element={<RegisterComplaint />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="complaints" element={<ComplaintsList />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Fallback to Login if route not found */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
