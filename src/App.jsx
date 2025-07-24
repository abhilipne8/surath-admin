import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WithdrawalList from './pages/sub-module/withdrawal/WithdrawalList';
import DepositeList from './pages/sub-module/deposite/DepositeList';
import Summary from './pages/sub-module/summary/Summary';
import Layout from './components/Layout';
import Login from './pages/login/Login';
import AuthenticatedRoute from './routes/AuthenticatedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import Dashboard from './pages/sub-module/dashboard/Dashboard';
import SurathDash from './pages/sub-module/dashboard/suarthDash/SurathDash';
import AllDash from './pages/sub-module/dashboard/allDash/AllDash';
import UpiDeposite from './pages/sub-module/deposite/UpiDeposite';

function App() {
  const token = localStorage.getItem('authToken'); // Adjusted token key

  return (
    <>
      <Routes>
        {/* Public login route */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <AuthenticatedRoute>
              <Layout />
            </AuthenticatedRoute>
          }
        >
          {/* Default redirect to /withdrawal-list */}
          <Route index element={<Navigate to="/withdrawal-list" />} />

          {/* Routes for all pages */}
          <Route
            path="withdrawal-list"
            element={
              <AuthenticatedRoute>
                <WithdrawalList />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="deposite-list"
            element={
              <AuthenticatedRoute>
                {/* <DepositeList /> */}
                <UpiDeposite />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="summary"
            element={
              <AuthenticatedRoute>
                <Summary />
              </AuthenticatedRoute>
            }
          />

          {/* Dashboards Route */}
          <Route
            path="dashboard"
            element={
              <AuthenticatedRoute>
                <AllDash />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="dashboard/surath-dash"
            element={
              <AuthenticatedRoute>
                <SurathDash />
              </AuthenticatedRoute>
            }
          />
        </Route>
        {/* 🔁 Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast container */}
      <ToastContainer />
    </>
  );
}

export default App;
