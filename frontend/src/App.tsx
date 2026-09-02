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
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Saved from './pages/Saved';
import SearchPage from './pages/Search';
import DeliveryTracking from './pages/DeliveryTracking';
import DoctorProfile from './pages/DoctorProfile';
import DoctorPatientDetails from './pages/DoctorPatientDetails';
import DoctorAvailability from './pages/DoctorAvailability';
import TrainerProfile from './pages/TrainerProfile';
import TrainerTraineeDetails from './pages/TrainerTraineeDetails';
import FarmerProfile from './pages/FarmerProfile';
import FarmerProducts from './pages/FarmerProducts';
import FarmerOrders from './pages/FarmerOrders';
import FarmerReports from './pages/FarmerReports';
import DeliveryProfile from './pages/DeliveryProfile';
import DeliveryHistory from './pages/DeliveryHistory';
import AdminUsers from './pages/AdminUsers';
import PrivateRoute from './components/PrivateRoute';

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
        <Route path="/admin-control" element={<PrivateRoute roles={['Admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute roles={['User', 'Doctor', 'Trainer', 'Farmer', 'Delivery']}><DashboardSwitcher /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute roles={['User', 'Doctor']}><Reports /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute roles={['User', 'Doctor', 'Admin', 'Delivery', 'Farmer', 'Trainer']}><Notifications /></PrivateRoute>} />
        <Route path="/saved" element={<PrivateRoute roles={['User']}><Saved /></PrivateRoute>} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/delivery-tracking" element={<PrivateRoute roles={['User', 'Delivery']}><DeliveryTracking /></PrivateRoute>} />
        <Route path="/doctor/profile" element={<PrivateRoute roles={['Doctor']}><DoctorProfile /></PrivateRoute>} />
        <Route path="/doctor/patients/:id" element={<PrivateRoute roles={['Doctor']}><DoctorPatientDetails /></PrivateRoute>} />
        <Route path="/doctor/availability" element={<PrivateRoute roles={['Doctor']}><DoctorAvailability /></PrivateRoute>} />
        <Route path="/trainer/profile" element={<PrivateRoute roles={['Trainer']}><TrainerProfile /></PrivateRoute>} />
        <Route path="/trainer/trainees/:id" element={<PrivateRoute roles={['Trainer']}><TrainerTraineeDetails /></PrivateRoute>} />
        <Route path="/farmer/profile" element={<PrivateRoute roles={['Farmer']}><FarmerProfile /></PrivateRoute>} />
        <Route path="/farmer/products" element={<PrivateRoute roles={['Farmer']}><FarmerProducts /></PrivateRoute>} />
        <Route path="/farmer/orders" element={<PrivateRoute roles={['Farmer']}><FarmerOrders /></PrivateRoute>} />
        <Route path="/farmer/reports" element={<PrivateRoute roles={['Farmer']}><FarmerReports /></PrivateRoute>} />
        <Route path="/delivery/profile" element={<PrivateRoute roles={['Delivery']}><DeliveryProfile /></PrivateRoute>} />
        <Route path="/delivery/history" element={<PrivateRoute roles={['Delivery']}><DeliveryHistory /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute roles={['Admin']}><AdminUsers /></PrivateRoute>} />

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
