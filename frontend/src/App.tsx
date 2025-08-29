// import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthProvider, { ProtectedRoute } from './context/AuthProvider';
import { ThemeProvider } from './context/ThemeProvider';


function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<h1>Home</h1>} />
            <Route path="/login" element={<h1>Login</h1>} />
            <Route path="/register" element={<h1>Register</h1>} />

            {/* Require Authentication */}
            <Route element={<ProtectedRoute />}>
              {/* Add the routes that need authentication */}
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
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

export default App
