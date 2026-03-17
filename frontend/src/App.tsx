import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Blog from "./pages/Blog";
import DevLog from "./pages/DevLog";
import AlgorithmDrill from "./pages/AlgorithmDrill";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BotDashboard from "./pages/BotDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/log" element={<DevLog />} />
          <Route path="/algorithm" element={<AlgorithmDrill />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/*" element={<Gallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/bottycoon" element={<BotDashboard />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
