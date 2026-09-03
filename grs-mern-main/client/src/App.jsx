import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));

// Student Pages
const StudentLogin = lazy(() => import('./pages/student/Login'));
const StudentRegister = lazy(() => import('./pages/student/Register'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const RaiseComplaint = lazy(() => import('./pages/student/RaiseComplaint'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageEntities = lazy(() => import('./pages/admin/ManageEntities'));

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, role, loading } = useAuth();
    
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Loading System...</div>;
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (allowedRole && role !== allowedRole) {
        // Redirect to appropriate dashboard based on actual role
        return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
    }
    
    return children;
};

// Global Layout to include Navbar
const MainLayout = ({ children }) => (
    <>
        <Navbar />
        {children}
    </>
);

const AppRoutes = () => {
    return (
        <Router>
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Loading Interface...</div>}>
                <Routes>
                    <Route path="/" element={<MainLayout><Home /></MainLayout>} />
                    
                    {/* Auth Routes */}
                    <Route path="/login" element={<MainLayout><StudentLogin /></MainLayout>} />
                    <Route path="/register" element={<MainLayout><StudentRegister /></MainLayout>} />
                    <Route path="/admin/login" element={<MainLayout><AdminLogin /></MainLayout>} />

                    {/* Student Protected Routes */}
                    <Route path="/student/dashboard" element={
                        <ProtectedRoute allowedRole="student">
                            <MainLayout><StudentDashboard /></MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/student/raise-complaint" element={
                        <ProtectedRoute allowedRole="student">
                            <MainLayout><RaiseComplaint /></MainLayout>
                        </ProtectedRoute>
                    } />

                    {/* Admin Protected Routes */}
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRole="admin">
                            <MainLayout><AdminDashboard /></MainLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/manage-entities" element={
                        <ProtectedRoute allowedRole="admin">
                            <MainLayout><ManageEntities /></MainLayout>
                        </ProtectedRoute>
                    } />
                    
                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;