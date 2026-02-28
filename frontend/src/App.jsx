import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import VoiceAssistant from './components/VoiceAssistant';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import AIAssistant from './pages/AIAssistant';
import Weather from './pages/Weather';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import CropRecommendation from './pages/CropRecommendation';
import DiseaseDetection from './pages/DiseaseDetection';
import FertilizerGuide from './pages/FertilizerGuide';
import ProfitCalculator from './pages/ProfitCalculator';
import MandiRates from './pages/MandiRates';
import Login from './pages/Login';
import Register from './pages/Register';
import KisanKhata from './pages/KisanKhata';
import SoilLabLocator from './pages/SoilLabLocator';

/** Redirect to /login if not authenticated */
function ProtectedRoute({ children }) {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? children : <Navigate to="/login" replace />;
}

/** Redirect to / if already authenticated */
function GuestRoute({ children }) {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? <Navigate to="/profile" replace /> : children;
}

function AppShell() {
    const { isLoggedIn } = useAuth();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="app-shell">
            {isLoggedIn && <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}
            <div className={`${isLoggedIn ? 'app-main' : 'app-main app-main--full'} ${sidebarOpen ? 'sidebar-open' : ''}`}>
                {isLoggedIn && <NotificationBell />}
                {isLoggedIn && <VoiceAssistant />}
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><ErrorBoundary><Home /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/ai" element={<ProtectedRoute><ErrorBoundary><AIAssistant /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/weather" element={<ProtectedRoute><ErrorBoundary><Weather /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/marketplace" element={<ProtectedRoute><ErrorBoundary><Marketplace /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ErrorBoundary><Profile /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/crop-recommendation" element={<ProtectedRoute><ErrorBoundary><CropRecommendation /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/disease-detection" element={<ProtectedRoute><ErrorBoundary><DiseaseDetection /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/fertilizer-guide" element={<ProtectedRoute><ErrorBoundary><FertilizerGuide /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/profit-calculator" element={<ProtectedRoute><ErrorBoundary><ProfitCalculator /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/mandi-rates" element={<ProtectedRoute><ErrorBoundary><MandiRates /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/kisan-khata" element={<ProtectedRoute><ErrorBoundary><KisanKhata /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="/soil-labs" element={<ProtectedRoute><ErrorBoundary><SoilLabLocator /></ErrorBoundary></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppShell />
                </BrowserRouter>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;
