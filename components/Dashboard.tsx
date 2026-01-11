
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Users, Activity, Utensils, ClipboardCheck } from 'lucide-react';

const data = [
  { name: 'Vata', value: 45, color: '#94a3b8' },
  { name: 'Pitta', value: 30, color: '#f87171' },
  { name: 'Kapha', value: 25, color: '#34d399' },
];

const activityData = [
  { day: 'Mon', patients: 12 },
  { day: 'Tue', patients: 19 },
  { day: 'Wed', patients: 15 },
  { day: 'Thu', patients: 22 },
  { day: 'Fri', patients: 30 },
  { day: 'Sat', patients: 10 },
  { day: 'Sun', patients: 5 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-blue-500" />} label="Total Patients" value="1,284" trend="+12%" />
        <StatCard icon={<Activity className="text-rose-500" />} label="Health Score Avg" value="78%" trend="+5%" />
        <StatCard icon={<Utensils className="text-emerald-500" />} label="Recipes Created" value="452" trend="+18" />
        <StatCard icon={<ClipboardCheck className="text-amber-500" />} label="Charts Pending" value="12" trend="-3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6">Patient Engagement Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="patients" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dosha Distribution */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6">Patient Dosha Mix</h3>
          <div className="h-64 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4">
              {data.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                  <span className="text-xs font-medium text-slate-500 uppercase">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold">Priority Patients</h3>
          <button className="text-emerald-600 text-sm font-semibold hover:underline">View All</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Dosha</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Checkup</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <PatientRow name="Arjun Sharma" dosha="Pitta-Vata" date="Today" status="High Priority" />
            <PatientRow name="Meera Nair" dosha="Kapha" date="2 days ago" status="Stable" />
            <PatientRow name="Vikram Singh" dosha="Vata" date="3 days ago" status="Follow-up" />
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
        {trend}
      </span>
    </div>
    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const PatientRow = ({ name, dosha, date, status }: any) => (
  <tr className="hover:bg-slate-50 transition-colors">
    <td className="px-6 py-4 font-semibold">{name}</td>
    <td className="px-6 py-4">
      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-tight">
        {dosha}
      </span>
    </td>
    <td className="px-6 py-4 text-slate-500 text-sm">{date}</td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
        status === 'High Priority' ? 'bg-rose-500 text-white' : 
        status === 'Stable' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
      }`}>
        {status}
      </span>
    </td>
  </tr>
);

export default Dashboard;
