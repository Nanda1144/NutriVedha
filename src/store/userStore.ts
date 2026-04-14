import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HealthReport {
    id: string;
    date: string;
    condition: string;
    symptoms: string[];
    severity: 'Low' | 'Medium' | 'High';
    recommendations: { title: string; text: string }[];
}

export interface Meal {
    time: string;
    meal: string;
    ingredients: string[];
    budget: boolean;
    health: string;
    instructions?: string;
    isDoctorRecommended?: boolean;
}

export interface FitnessProfile {
    bodyType: 'bulk' | 'skinny' | 'cut' | null;
    ageStage: 1 | 2 | 3 | null; // 1: 10-18, 2: 18-30, 3: 30+
    trainerId: string | null;
    isPremium: boolean;
    workoutStreak: number;
    weightHistory: { date: string; weight: number }[];
    completedWorkouts: string[]; // IDs of completed exercises
}

export interface AuditLog {
    id: string;
    accessor: string;
    role: string;
    action: string;
    timestamp: string;
    status: 'Success' | 'Denied';
}

export interface RBACSettings {
    doctor: boolean;
    trainer: boolean;
    farmer: boolean;
}

export interface SecuritySettings {
    twoStepVerification: boolean;
    dataEncrypted: boolean;
    lastBackup: string;
    integrityPassed: boolean;
}

export interface AdminActivity {
    id: string;
    adminName: string;
    action: string;
    timestamp: string;
    details: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

export interface SystemUpdate {
    id: string;
    title: string;
    content: string;
    timestamp: string;
    adminName: string;
}

interface UserStore {
    reports: HealthReport[];
    lastScanResult: HealthReport | null;
    scannedImages: string[]; // Store base64 or URLs of scanned images
    savedRecipes: any[];
    savedDietPlans: any[];
    cropBookings: any[];
    fitnessProfile: FitnessProfile;
    rbac: RBACSettings;
    auditLogs: AuditLog[];
    securitySettings: SecuritySettings;
    mentorList: any[];
    traineeData: any[]; // For Trainer Mode
    userProfile: {
        name: string;
        email: string;
        phone: string;
        address: string;
        avatar: string;
        role: 'User' | 'Doctor' | 'Trainer' | 'Farmer' | 'Delivery';
        age: number;
        dob: string;
        weight: number;
        height: number;
        bloodGroup: string;
        diseases: string[];
        fitnessGoal: string;
        education: string;
        memberSince: string;
    };
    addReport: (report: HealthReport) => void;
    setLastScan: (report: HealthReport | null) => void;
    addScannedImage: (img: string) => void;
    saveRecipe: (recipe: any) => void;
    saveDietPlan: (plan: any) => void;
    addCropBooking: (booking: any) => void;
    updateProfile: (profile: Partial<UserStore['userProfile']>) => void;
    updateFitnessProfile: (profile: Partial<FitnessProfile>) => void;
    updateRBAC: (rbac: Partial<RBACSettings>) => void;
    updateSecurity: (settings: Partial<SecuritySettings>) => void;
    isAdminAuthenticated: boolean;
    adminKeyMember: string | null;
    chatHistory: ChatMessage[];
    adminActionHistory: AdminActivity[];
    systemUpdates: SystemUpdate[];
    deliveryOrders: any[];
    patients: any[];
    cropInventory: any[];
    setAdminAuthenticated: (status: boolean, memberName: string | null) => void;
    addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    addAdminAction: (action: Omit<AdminActivity, 'id' | 'timestamp'>) => void;
    addSystemUpdate: (update: Omit<SystemUpdate, 'id' | 'timestamp'>) => void;
    clearChat: () => void;
    addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
    setRole: (role: 'User' | 'Doctor' | 'Trainer' | 'Farmer' | 'Delivery') => void;
    completeWorkout: (workoutId: string) => void;
    setTraineeData: (data: any[]) => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            reports: [],
            lastScanResult: null,
            scannedImages: [],
            savedRecipes: [],
            savedDietPlans: [],
            cropBookings: [],
            rbac: {
                doctor: true,
                trainer: true,
                farmer: false
            },
            mentorList: [
                { id: 'm1', name: 'Dr. Anjali', expertise: 'Yoga & Stress Management', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali', rating: 4.9 },
                { id: 'm2', name: 'Kabir Singh', expertise: 'Strength & Conditioning', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir', rating: 4.8 },
                { id: 'm3', name: 'Saira Banu', expertise: 'Ayurvedic Nutrition', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Saira', rating: 5.0 }
            ],
            traineeData: [
                { id: 't1', name: 'Amit Shah', progress: 65, lastActive: '2 hours ago', goal: 'Weight Loss' },
                { id: 't2', name: 'Priya Rai', progress: 80, lastActive: 'Yesterday', goal: 'Muscle Gain' }
            ],
            auditLogs: [
                { id: '1', accessor: 'Dr. Sameer', role: 'Doctor', action: 'Viewed AI Scan Report', timestamp: '2026-01-27 10:30', status: 'Success' },
                { id: '2', accessor: 'System AI', role: 'AI', action: 'Generated Diet Plan', timestamp: '2026-01-27 08:15', status: 'Success' },
                { id: '3', accessor: 'Trainer Vikram', role: 'Trainer', action: 'Viewed Fitness Progress', timestamp: '2026-01-26 18:00', status: 'Success' }
            ],
            securitySettings: {
                twoStepVerification: false,
                dataEncrypted: true,
                lastBackup: '2026-01-27 02:00',
                integrityPassed: true
            },
            fitnessProfile: {
                bodyType: null,
                ageStage: null,
                trainerId: null,
                isPremium: false,
                workoutStreak: 0,
                weightHistory: [
                    { date: '2026-01-01', weight: 70 },
                    { date: '2026-01-15', weight: 68 },
                    { date: '2026-01-27', weight: 67 }
                ],
                completedWorkouts: []
            },
            userProfile: {
                name: "Rajesh Kumar",
                email: "rajesh.k@example.com",
                phone: "+91 98765 43210",
                address: "Flat 402, Neural Residency, Tech Park Road, Bengaluru, Karnataka",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
                role: 'User',
                age: 28,
                dob: "1997-05-15",
                weight: 67,
                height: 175,
                bloodGroup: "O+",
                diseases: ["Seasonal Allergies"],
                fitnessGoal: "Muscle Gain & Flexibility",
                education: "Master of Computer Applications (MCA)",
                memberSince: 'Jan 2026'
            },
            isAdminAuthenticated: false,
            adminKeyMember: null,
            chatHistory: [{ id: '0', role: 'assistant', content: 'Welcome to AyurAI Intelligence. How can I assist you today?', timestamp: new Date().toISOString() }],
            adminActionHistory: [],
            systemUpdates: [
                { id: '1', title: 'Welcome to AyurAI v1.0', content: 'We are live with our AI Health Scan and Ayurvedic Diet modules.', timestamp: new Date().toISOString(), adminName: 'System' }
            ],
            addReport: (report) => set((state) => ({
                reports: [report, ...state.reports],
                lastScanResult: report
            })),
            setLastScan: (report) => set({ lastScanResult: report }),
            addScannedImage: (img) => set((state) => ({
                scannedImages: [img, ...state.scannedImages]
            })),
            saveRecipe: (recipe) => set((state) => ({
                savedRecipes: [...state.savedRecipes, recipe]
            })),
            saveDietPlan: (plan) => set((state) => ({
                savedDietPlans: [...state.savedDietPlans, plan]
            })),
            addCropBooking: (booking) => set((state) => ({
                cropBookings: [booking, ...state.cropBookings]
            })),
            updateProfile: (profile) => set((state) => ({
                userProfile: { ...state.userProfile, ...profile }
            })),
            updateFitnessProfile: (profile) => set((state) => ({
                fitnessProfile: { ...state.fitnessProfile, ...profile }
            })),
            updateRBAC: (rbacUpdates) => set((state) => ({
                rbac: { ...state.rbac, ...rbacUpdates }
            })),
            updateSecurity: (securityUpdates) => set((state) => ({
                securitySettings: { ...state.securitySettings, ...securityUpdates }
            })),
            addAuditLog: (log) => set((state) => ({
                auditLogs: [{ ...log, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() } as AuditLog, ...state.auditLogs]
            })),
            deliveryOrders: [
                { id: 'ORD-101', customer: 'Pavan Kumar', address: '123 Neural Lane, BLR', status: 'Pending', items: 'Ashwagandha Roots, Organic Honey' },
                { id: 'ORD-102', customer: 'Anjali Sharma', address: '456 Wellness Rd, BLR', status: 'In Transit', items: 'Tulsi Tea, Neem Tablets' }
            ],
            patients: [
                { id: 'P-001', name: 'Rahul V.', condition: 'Kapha Imbalance', lastVisit: '2 days ago', risk: 'Medium' },
                { id: 'P-002', name: 'Suhani G.', condition: 'Pitta Imbalance', lastVisit: '5 days ago', risk: 'Low' }
            ],
            cropInventory: [
                { id: 'C-01', name: 'Ashwagandha', qty: '50kg', harvest: 'Sep 2026', prebooked: '30kg' },
                { id: 'C-02', name: 'Brahmi', qty: '20kg', harvest: 'Oct 2026', prebooked: '15kg' }
            ],
            setAdminAuthenticated: (status, memberName) => set({ isAdminAuthenticated: status, adminKeyMember: memberName }),
            setRole: (role) => set((state) => ({ userProfile: { ...state.userProfile, role } })),
            addChatMessage: (msg) => set((state) => ({
                chatHistory: [...state.chatHistory, { ...msg, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }]
            })),
            addAdminAction: (action) => set((state) => ({
                adminActionHistory: [{ ...action, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }, ...state.adminActionHistory]
            })),
            addSystemUpdate: (update) => set((state) => ({
                systemUpdates: [{ ...update, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }, ...state.systemUpdates]
            })),
            clearChat: () => set({ chatHistory: [] }),
            completeWorkout: (workoutId: string) => set((state) => ({
                fitnessProfile: {
                    ...state.fitnessProfile,
                    completedWorkouts: [...state.fitnessProfile.completedWorkouts, workoutId],
                    workoutStreak: state.fitnessProfile.workoutStreak + 1
                }
            })),
            setTraineeData: (data: any[]) => set({ traineeData: data }),
        }),
        {
            name: 'ayurai-health-storage-v8',
        }
    )
);
