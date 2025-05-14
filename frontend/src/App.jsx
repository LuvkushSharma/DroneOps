import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { DronesProvider } from './context/DronesContext';
import { MissionsProvider } from './context/MissionsContext';
import { SurveysProvider } from './context/SurveysContext';

// Layout
import AppLayout from './components/Applayout';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DronesProvider>
          <MissionsProvider>
            <SurveysProvider>
              <AppLayout />
              <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </SurveysProvider>
          </MissionsProvider>
        </DronesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;