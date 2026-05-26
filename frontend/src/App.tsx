// import { useState } from 'react'
import "./App.css";
import { Routes, Route } from "react-router-dom";
import AuthProvider, { ProtectedRoute } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { LoginForm } from "./auth/Login";
import { RegisterForm } from "./auth/Register";
import Layout from "./components/Layout";
import { ForgotPasswordForm } from "./auth/ForgotPassword";
import { NotFound } from "./components/NotFound";
import { Dashboard } from "./pages/Dashboard";
import VerfiyEmail from "./auth/VerfiyEmail";
import { ResetPasswordForm } from "./auth/ResetPassword";
import LandingPage from "./pages/landing/LandingPage";
import ContactUs from "./pages/landing/Contact-Us";
import LeadCaptureForm from "./pages/landing/LeadCaptureForm";
import { Toaster } from "./components/ui/sonner";
import PropertyEntryGate from "./components/PropertyEntryGate";
import Unauthorised from "./components/Unauthorised";
import PropertyManagementPage from "./pages/properties/PropertyManagementPage";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route
            path="/capture-lead/:propertyType"
            element={<LeadCaptureForm />}
          />
          <Route
            path="/property-entry/:propertyType"
            element={<PropertyEntryGate />}
          />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/verify-email" element={<VerfiyEmail />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/unauthorised" element={<Unauthorised />} />
          <Route path="*" element={<NotFound />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/dashboard/properties"
                element={<PropertyManagementPage />}
              />
            </Route>
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </AuthProvider>
    // <>
    //   <div>
    //     <a href="https://vite.dev" target="_blank">
    //       <img src={viteLogo} className="logo" alt="Vite logo" />
    //     </a>
    //     <a href="https://react.dev" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a>
    //   </div>
    //   <h1>Vite + React</h1>
    //   <div className="card">
    //     <button onClick={() => setCount((count) => count + 1)}>
    //       count is {count}
    //     </button>
    //     <p>
    //       Edit <code>src/App.tsx</code> and save to test HMR
    //     </p>
    //   </div>
    //   <p className="read-the-docs">
    //     Click on the Vite and React logos to learn more
    //   </p>
    // </>
  );
}

export default App;
