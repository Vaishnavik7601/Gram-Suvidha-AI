import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import FieldWorkers from './pages/admin/FieldWorkers';
import ComplaintsManagement from './pages/admin/ComplaintsManagement';
import SchemeApplicants from './pages/admin/SchemeApplicants';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import RegisterComplaint from './pages/citizen/RegisterComplaint';
import Schemes from './pages/citizen/Schemes';
import Profile from './pages/citizen/Profile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Chatbot from './components/Chatbot';
import { LanguageProvider } from './context/LanguageContext';
import LanguageSelector from './components/LanguageSelector';

function App() {
  return (
    <LanguageProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="workers" element={<FieldWorkers />} />
          <Route path="complaints" element={<ComplaintsManagement />} />
          <Route path="schemes" element={<SchemeApplicants />} />
        </Route>

        {/* Citizen Routes */}
        <Route path="/citizen" element={<DashboardLayout role="citizen" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CitizenDashboard />} />
          <Route path="complaint" element={<RegisterComplaint />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
      <LanguageSelector />
    </Router>
    </LanguageProvider>
  );
}

export default App;
