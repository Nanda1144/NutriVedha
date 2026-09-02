import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Diet from './pages/Diet';
import Recipes from './pages/Recipes';
import FoodIntel from './pages/FoodIntel';
import Telemedicine from './pages/Telemedicine';
import SignAI from './pages/SignAI';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import Fitness from './pages/Fitness';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import DashboardSwitcher from './pages/Dashboards';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/food-intel" element={<FoodIntel />} />
        <Route path="/telemedicine" element={<Telemedicine />} />
        <Route path="/sign-ai" element={<SignAI />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/fitness" element={<Fitness />} />
        <Route path="/admin-control" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardSwitcher />} />

        {/* Features matching Home Page Features grid paths */}
        <Route path="/ai-disease-scan" element={<Scan />} />
        <Route path="/budget-friendly-ayurvedic-diet" element={<Diet />} />
        <Route path="/teleconsultation" element={<Telemedicine />} />
        <Route path="/ai-recipe-generator" element={<Recipes />} />
        <Route path="/sign-language-to-text/voice" element={<SignAI />} />
      </Routes>
    </Layout>
  );
}

export default App;
