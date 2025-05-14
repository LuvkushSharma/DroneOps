import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import socketManager from '../utils/socketManager';

// Components
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import DronesPage from '../pages/DronesPage';
import DroneDetailsPage from '../pages/DroneDetailsPage';
import AddDronePage from '../pages/AddDronePage';
import MissionsPage from '../pages/MissionsPage';
import MissionDetailsPage from '../pages/MissionDetailsPage';
import CreateMissionPage from '../pages/CreateMissionPage';
import MonitorPage from '../pages/MonitorPage';
import SurveysPage from '../pages/SurveysPage';
import SurveyDetailsPage from '../pages/SurveyDetailsPage';
import CreateSurveyPage from '../pages/CreateSurveyPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import SurveyAnalyticsPage from '../pages/SurveyAnalyticsPage';
import ProfilePage from '../pages/ProfilePage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppLayout = () => {
  const { user, loading, isAuthenticated, getToken } = useAuth();
  const location = useLocation();
  
  // Initialize socket connection when authenticated user changes
  React.useEffect(() => {
    if (user) {
      const token = getToken();
      // Check what methods are available on socketManager
      if (socketManager.connect) {
        // If connect method exists, use that instead of init
        socketManager.connect('general', {}, null, null);
      }
      
      return () => {
        if (socketManager.disconnect) {
          socketManager.disconnect();
        }
      };
    }
  }, [user, getToken]);

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if we're on a public route (login/register)
  const isPublicRoute = ['/login', '/register'].includes(location.pathname);

  if (isAuthenticated() && isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {!isPublicRoute ? (
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar is rendered conditionally based on authentication */}
          {isAuthenticated() && <Sidebar />}
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navbar is rendered conditionally based on authentication */}
            {isAuthenticated() && <Navbar />}
            
            {/* Main content area */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                {/* Drones Routes - Order matters! */}
                <Route path="/drones/add" element={
                  <ProtectedRoute>
                    <AddDronePage />
                  </ProtectedRoute>
                } />
                <Route path="/drones/edit/:id" element={
                  <ProtectedRoute>
                    <AddDronePage />
                  </ProtectedRoute>
                } />
                <Route path="/drones/:id" element={
                  <ProtectedRoute>
                    <DroneDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/drones" element={
                  <ProtectedRoute>
                    <DronesPage />
                  </ProtectedRoute>
                } />

                {/* User Routes */}
                <Route path="/profile" element={
                <ProtectedRoute>
                    <ProfilePage />
                </ProtectedRoute>
                } />
                <Route path="/settings" element={
                <ProtectedRoute>
                    <ProfilePage /> {/* You might want to create a separate SettingsPage component */}
                </ProtectedRoute>
                } />
                
                {/* Missions Routes - Order matters! */}
                <Route path="/missions/create" element={
                  <ProtectedRoute>
                    <CreateMissionPage />
                  </ProtectedRoute>
                } />
                <Route path="/missions/edit/:id" element={
                  <ProtectedRoute>
                    <CreateMissionPage />
                  </ProtectedRoute>
                } />
                <Route path="/missions/:id" element={
                  <ProtectedRoute>
                    <MissionDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/missions" element={
                  <ProtectedRoute>
                    <MissionsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/monitor/:id" element={
                    <ProtectedRoute>
                        <MonitorPage />
                    </ProtectedRoute>
                } />
                
                {/* Surveys Routes - Order matters! */}
                <Route path="/surveys/create" element={
                  <ProtectedRoute>
                    <CreateSurveyPage />
                  </ProtectedRoute>
                } />
                <Route path="/surveys/edit/:id" element={
                  <ProtectedRoute>
                    <CreateSurveyPage />
                  </ProtectedRoute>
                } />
                <Route path="/surveys/:id" element={
                  <ProtectedRoute>
                    <SurveyDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/surveys" element={
                  <ProtectedRoute>
                    <SurveysPage />
                  </ProtectedRoute>
                } />
                
                {/* Analytics Routes */}
                <Route path="/analytics/surveys/:id" element={
                  <ProtectedRoute>
                    <SurveyAnalyticsPage />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } />
                
                {/* Redirect any unknown protected paths to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        /* Public routes */
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      )}
    </>
  );
};

export default AppLayout;