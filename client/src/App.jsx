import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InputPage from "./pages/InputPage";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import Home from "./pages/Home";
import Navbar from "./components/Navbar"; // ✅ Added Navbar

function App() {
  return (
    <Router>
      {/* ✅ Global Navbar across all pages */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<InputPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ Fallback route for unknown URLs */}
        <Route path="*" element={<h1 className="text-center mt-10">404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
