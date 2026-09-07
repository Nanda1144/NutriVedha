import React from 'react';
import { useUserStore } from '../store/userStore';
import UserDashboard from './user/UserDashboard';
import DoctorDashboard from './doctor/DoctorDashboard';
import FarmerDashboard from './farmer/FarmerDashboard';
import TrainerDashboard from './trainer/TrainerDashboard';
import DeliveryDashboard from './delivery/DeliveryDashboard';
import './Dashboards.css';

const DashboardSwitcher: React.FC = () => {
    const { userProfile } = useUserStore();
    const role = userProfile.role;

    const renderDashboard = () => {
        switch (role) {
            case 'Doctor':
                return <DoctorDashboard />;
            case 'Farmer':
                return <FarmerDashboard />;
            case 'Trainer':
                return <TrainerDashboard />;
            case 'Delivery':
                return <DeliveryDashboard />;
            case 'User':
            default:
                return <UserDashboard />;
        }
    };

    return (
        <div className="dashboard-container animate-fade-in">
            <header className="dashboard-header-bar glass-card">
                <div className="role-indicator">
                    <span className={`role-pill role-${role.toLowerCase()}`}>
                        {role.toUpperCase()} COMMAND CENTER
                    </span>
                </div>
                <div className="dashboard-meta">
                    <span className="live-pulse"></span>
                    <span className="meta-text">Real-time Node: BLR-ALPHA</span>
                </div>
            </header>

            {renderDashboard()}
        </div>
    );
};

export default DashboardSwitcher;
