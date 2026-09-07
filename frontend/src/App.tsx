import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PublicLayout from './components/main/PublicLayout';
import MainHome from './pages/main/Home';
import About from './pages/main/About';
import Services from './pages/main/Services';
import Developers from './pages/main/Developers';
import Contact from './pages/main/Contact';
import Signup from './pages/main/Signup';
import './styles/main-public.css';
import Scan from './pages/Scan';
import Diet from './pages/Diet';
import Recipes from './pages/Recipes';
import FoodIntel from './pages/FoodIntel';
import Telemedicine from './pages/Telemedicine';
import SignAI from './pages/SignAI';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import Fitness from './pages/Fitness';
import { AdminLayout } from './components/AdminLayout';
import AdminDashboardNew from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminTrainers from './pages/admin/AdminTrainers';
import AdminFarmers from './pages/admin/AdminFarmers';
import AdminDelivery from './pages/admin/AdminDelivery';
import AdminMarketplace from './pages/admin/AdminMarketplace';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAiMonitoring from './pages/admin/AdminAiMonitoring';
import AdminReports from './pages/admin/AdminReports';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSystem from './pages/admin/AdminSystem';
import Login from './pages/Login';
import DashboardSwitcher from './pages/Dashboards';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Saved from './pages/Saved';
import SearchPage from './pages/Search';
import DeliveryTracking from './pages/DeliveryTracking';
import { DoctorLayout } from './components/DoctorLayout';
import DoctorDashboardNew from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPatientTabs from './pages/doctor/DoctorPatientTabs';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorAiReports from './pages/doctor/DoctorAiReports';
import DoctorDietReviews from './pages/doctor/DoctorDietReviews';
import DoctorTelemedicineNew from './pages/doctor/DoctorTelemedicine';
import DoctorAvailabilityNew from './pages/doctor/DoctorAvailability';
import DoctorMessages from './pages/doctor/DoctorMessages';
import DoctorProfileNew from './pages/doctor/DoctorProfileNew';
import { TrainerLayout } from './components/TrainerLayout';
import TrainerDashboardNew from './pages/trainer/TrainerDashboard';
import TrainerMembers from './pages/trainer/TrainerMembers';
import TrainerMemberDetails from './pages/trainer/TrainerMemberDetails';
import TrainerJoinRequests from './pages/trainer/TrainerJoinRequests';
import TrainerWorkoutPlans from './pages/trainer/TrainerWorkoutPlans';
import TrainerYoga from './pages/trainer/TrainerYoga';
import TrainerSessions from './pages/trainer/TrainerSessions';
import TrainerProgress from './pages/trainer/TrainerProgress';
import TrainerMessages from './pages/trainer/TrainerMessages';
import TrainerEarnings from './pages/trainer/TrainerEarnings';
import TrainerProfileNew from './pages/trainer/TrainerProfile';
import { FarmerLayout } from './components/FarmerLayout';
import FarmerDashboardNew from './pages/farmer/FarmerDashboard';
import FarmerCrops from './pages/farmer/FarmerCrops';
import FarmerPreBookings from './pages/farmer/FarmerPreBookings';
import FarmerOrdersNew from './pages/farmer/FarmerOrders';
import FarmerHarvest from './pages/farmer/FarmerHarvest';
import FarmerInventory from './pages/farmer/FarmerInventory';
import FarmerEarnings from './pages/farmer/FarmerEarnings';
import FarmerReportsNew from './pages/farmer/FarmerReports';
import FarmerProfileNew from './pages/farmer/FarmerProfile';
import { DeliveryLayout } from './components/DeliveryLayout';
import DeliveryDashboardNew from './pages/delivery/DeliveryDashboard';
import DeliveryToday from './pages/delivery/DeliveryToday';
import DeliveryActive from './pages/delivery/DeliveryActive';
import DeliveryRoute from './pages/delivery/DeliveryRoute';
import DeliveryHistoryNew from './pages/delivery/DeliveryHistory';
import DeliveryEarnings from './pages/delivery/DeliveryEarnings';
import DeliveryProfileNew from './pages/delivery/DeliveryProfile';
import PrivateRoute from './components/PrivateRoute';
import { UserLayout } from './components/UserLayout';
import { useEffect } from 'react';
import { useUserStore } from './store/userStore';
import { getAuthToken } from './services/client';
import UserDashboard from './pages/user/UserDashboard';
import UserHealth from './pages/user/UserHealth';
import UserAiScan from './pages/user/UserAiScan';
import UserDiet from './pages/user/UserDiet';
import UserFitness from './pages/user/UserFitness';
import UserDoctors from './pages/user/UserDoctors';
import UserMarketplace from './pages/user/UserMarketplace';
import UserOrders from './pages/user/UserOrders';
import UserReports from './pages/user/UserReports';
import UserNotifications from './pages/user/UserNotifications';
import UserProfile from './pages/user/UserProfile';

function App() {
  // Restore auth state from backend source of truth on reload (spec 39)
  const { updateProfile, setRole } = useUserStore();
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(r => r.json())
      .then(data => {
        if (data?.user) {
          const u = data.user;
          updateProfile({ name: u.name, email: u.email, role: u.role as any });
          setRole(u.role as any);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Routes>
      {/* ========== PUBLIC — Main_interface merged (single entry) ========== */}
      {/* Microservices: public pages are static, auth via auth.service -> gateway :8080 */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<MainHome />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Auth — Login uses microservices auth.service (gateway :8080) */}
      <Route path="/login" element={<Login />} />

      {/* ========== GENERIC AUTHENTICATED (Layout wrapper, microservices client) ========== */}
      <Route path="/scan" element={<Layout><Scan /></Layout>} />
      <Route path="/diet" element={<Layout><Diet /></Layout>} />
      <Route path="/recipes" element={<Layout><Recipes /></Layout>} />
      <Route path="/food-intel" element={<Layout><FoodIntel /></Layout>} />
      <Route path="/telemedicine" element={<Layout><Telemedicine /></Layout>} />
      <Route path="/sign-ai" element={<Layout><SignAI /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
      <Route path="/fitness" element={<Layout><Fitness /></Layout>} />
      <Route path="/dashboard" element={<PrivateRoute roles={['User', 'Doctor', 'Trainer', 'Farmer', 'Delivery']}><Layout><DashboardSwitcher /></Layout></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute roles={['User', 'Doctor']}><Layout><Reports /></Layout></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute roles={['User', 'Doctor', 'Admin', 'Delivery', 'Farmer', 'Trainer']}><Layout><Notifications /></Layout></PrivateRoute>} />
      <Route path="/saved" element={<PrivateRoute roles={['User']}><Layout><Saved /></Layout></PrivateRoute>} />
      <Route path="/search" element={<Layout><SearchPage /></Layout>} />
      <Route path="/delivery-tracking" element={<PrivateRoute roles={['User', 'Delivery']}><Layout><DeliveryTracking /></Layout></PrivateRoute>} />

      {/* ========== DOCTOR — 9 routes, doctor.service -> gateway /doctor ========== */}
      <Route element={<PrivateRoute roles={['Doctor']}><DoctorLayout /></PrivateRoute>}>
        <Route path="/doctor/dashboard" element={<DoctorDashboardNew />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/doctor/patients/:id" element={<DoctorPatientTabs />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/ai-reports" element={<DoctorAiReports />} />
        <Route path="/doctor/diet-reviews" element={<DoctorDietReviews />} />
        <Route path="/doctor/telemedicine" element={<DoctorTelemedicineNew />} />
        <Route path="/doctor/availability" element={<DoctorAvailabilityNew />} />
        <Route path="/doctor/messages" element={<DoctorMessages />} />
        <Route path="/doctor/profile" element={<DoctorProfileNew />} />
      </Route>

      {/* ========== TRAINER — 10 routes, trainer.service -> gateway /trainer ========== */}
      <Route element={<PrivateRoute roles={['Trainer']}><TrainerLayout /></PrivateRoute>}>
        <Route path="/trainer/dashboard" element={<TrainerDashboardNew />} />
        <Route path="/trainer/members" element={<TrainerMembers />} />
        <Route path="/trainer/members/:id" element={<TrainerMemberDetails />} />
        <Route path="/trainer/join-requests" element={<TrainerJoinRequests />} />
        <Route path="/trainer/workout-plans" element={<TrainerWorkoutPlans />} />
        <Route path="/trainer/yoga" element={<TrainerYoga />} />
        <Route path="/trainer/sessions" element={<TrainerSessions />} />
        <Route path="/trainer/progress" element={<TrainerProgress />} />
        <Route path="/trainer/messages" element={<TrainerMessages />} />
        <Route path="/trainer/earnings" element={<TrainerEarnings />} />
        <Route path="/trainer/profile" element={<TrainerProfileNew />} />
      </Route>
      {/* ========== FARMER — 9 routes, farmer.service -> gateway /farmer ========== */}
      <Route element={<PrivateRoute roles={['Farmer']}><FarmerLayout /></PrivateRoute>}>
        <Route path="/farmer/dashboard" element={<FarmerDashboardNew />} />
        <Route path="/farmer/crops" element={<FarmerCrops />} />
        <Route path="/farmer/pre-bookings" element={<FarmerPreBookings />} />
        <Route path="/farmer/orders" element={<FarmerOrdersNew />} />
        <Route path="/farmer/harvest" element={<FarmerHarvest />} />
        <Route path="/farmer/inventory" element={<FarmerInventory />} />
        <Route path="/farmer/earnings" element={<FarmerEarnings />} />
        <Route path="/farmer/reports" element={<FarmerReportsNew />} />
        <Route path="/farmer/profile" element={<FarmerProfileNew />} />
      </Route>
      {/* ========== DELIVERY — 7 routes, delivery.service -> gateway /delivery ========== */}
      <Route element={<PrivateRoute roles={['Delivery']}><DeliveryLayout /></PrivateRoute>}>
        <Route path="/delivery/dashboard" element={<DeliveryDashboardNew />} />
        <Route path="/delivery/today" element={<DeliveryToday />} />
        <Route path="/delivery/active" element={<DeliveryActive />} />
        <Route path="/delivery/route" element={<DeliveryRoute />} />
        <Route path="/delivery/history" element={<DeliveryHistoryNew />} />
        <Route path="/delivery/earnings" element={<DeliveryEarnings />} />
        <Route path="/delivery/profile" element={<DeliveryProfileNew />} />
      </Route>
      {/* ========== ADMIN — 12 routes, analytics.service -> gateway /analytics ========== */}
      <Route element={<PrivateRoute roles={['Admin']}><AdminLayout /></PrivateRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboardNew />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/trainers" element={<AdminTrainers />} />
        <Route path="/admin/farmers" element={<AdminFarmers />} />
        <Route path="/admin/delivery" element={<AdminDelivery />} />
        <Route path="/admin/marketplace" element={<AdminMarketplace />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/ai-monitoring" element={<AdminAiMonitoring />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
        <Route path="/admin/system" element={<AdminSystem />} />
      </Route>
      {/* ========== USER — 11 routes, user.service + ai/marketplace/etc ========== */}
      <Route element={<PrivateRoute roles={['User']}><UserLayout /></PrivateRoute>}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/health" element={<UserHealth />} />
        <Route path="/user/ai-scan" element={<UserAiScan />} />
        <Route path="/user/diet" element={<UserDiet />} />
        <Route path="/user/fitness" element={<UserFitness />} />
        <Route path="/user/doctors" element={<UserDoctors />} />
        <Route path="/user/marketplace" element={<UserMarketplace />} />
        <Route path="/user/orders" element={<UserOrders />} />
        <Route path="/user/reports" element={<UserReports />} />
        <Route path="/user/notifications" element={<UserNotifications />} />
        <Route path="/user/profile" element={<UserProfile />} />
      </Route>

      {/* Legacy generic feature aliases */}
      <Route path="/ai-disease-scan" element={<Layout><Scan /></Layout>} />
      <Route path="/budget-friendly-ayurvedic-diet" element={<Layout><Diet /></Layout>} />
      <Route path="/teleconsultation" element={<Layout><Telemedicine /></Layout>} />
      <Route path="/ai-recipe-generator" element={<Layout><Recipes /></Layout>} />
      <Route path="/sign-language-to-text/voice" element={<Layout><SignAI /></Layout>} />
    </Routes>
  );
}

export default App;
