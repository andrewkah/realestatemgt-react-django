import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <nav className="p-4 bg-amber-600 flex gap-4">
          <Link to="/" className="text-blue-500 hover:underline">
            Home
          </Link>
          <Link to="/" className="text-green-500 hover:underline">
            About
          </Link>
        </nav>
        <div className="p-4">
          <Routes>
            <Route path="/"  />
            <Route path="/about" />
          </Routes>
        </div>
      </Router>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App
