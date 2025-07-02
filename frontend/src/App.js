// frontend/src/App.js
import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';

const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Dashboard = lazy(() => import('./components/Dashboard'));

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AppWrapper() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Router>
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  );
}
