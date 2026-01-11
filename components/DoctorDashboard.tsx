
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Users, Activity, Utensils, ClipboardCheck, AlertCircle, ChevronRight, Calendar, Clock } from 'lucide-react';

const data = [
  { name: 'Vata', value: 45, color: '#94a3b8' },
  { name: 'Pitta', value: 30, color: '#f87171' },
  { name: 'Kapha', value: 25, color: '#34d399' },
];

const activityData = [
  { day: 'Mon', patients: 12 }, { day: 'Tue', patients: 19 }, { day: 'Wed', patients: 15 },
  { day: 'Thu', patients: 22 }, { day: 'Fri', patients: 30 }, { day: 'Sat', patients: 10 },
  { day: 'Sun', patients: 5 },
];

const DoctorDashboard: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-teal-900 font-serif">Vaidya Intelligence</h2>
          <p className="text-slate-500 font-medium">Population health overview & clinical flow</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
           <div className="flex-1 sm:flex-initial px-6 py-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600">2 Critical Pathya Alerts</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard icon={<Users className="text-blue-500" />} label="Active Registry" value="1,284" trend="+12%" />
        <StatCard icon={<Activity className="text-rose-500" />} label="Success Rate" value="92%" trend="+5%" trendColor="emerald" />
        <StatCard icon={<Utensils className="text-emerald-500" />} label="Charts Gen" value="452" trend="+18" />
        <StatCard icon={<ClipboardCheck className="text-amber-500" />} label="Unread Logs" value="12" trend="-3" trendColor="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Appointments Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
           <h3 className="text-xl font-bold flex items-center justify-between">
              Today's Rituals
              <Calendar size={18} className="text-teal-600" />
           </h3>
           <div className="space-y-4">
              <AppointmentItem time="09:00 AM" name="Arjun Sharma" type="Pitta Review" active />
              <AppointmentItem time="11:30 AM" name="Sita Devi" type="Initial Nadi" />
              <AppointmentItem time="02:00 PM" name="Rajesh Kumar" type="Kapha Balancing" />
              <AppointmentItem time="04:45 PM" name="Meena Iyer" type="Diet Adjustment" />
           </div>
           <button className="w-full py-4 border-2 border-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
              Manage Calendar
           </button>
        </div>

        <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-8">Patient Engagement Flux</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 700}} 
                />
                <Bar dataKey="patients" fill="#134e4a" radius={[12, 12, 12, 12]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold">Priority Registry</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">High severity alerts from NutriVedha Core</p>
          </div>
          <button className="text-xs bg-rose-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-100 flex items-center gap-2">
            <AlertCircle size={16} /> Attention Required
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vikriti Balance</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Log Insight</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <PatientRow name="Arjun Sharma" dosha="Pitta-Anubandha" date="Acidity Spike + Sleep" status="Adjust Herb" />
              <PatientRow name="Sita Devi" dosha="Vata-Dry" date="Severe Constipation" status="Hydrate/Oil" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, trendColor }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-teal-50 group-hover:text-teal-900 transition-all duration-500">{icon}</div>
      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
        trendColor === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
      }`}>
        {trend}
      </span>
    </div>
    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-900">{value}</p>
  </div>
);

const AppointmentItem = ({ time, name, type, active }: any) => (
  <div className={`p-5 rounded-3xl border transition-all ${active ? 'bg-teal-900 text-white shadow-xl shadow-teal-100 translate-x-2' : 'bg-slate-50 border-slate-100 hover:border-emerald-200'}`}>
    <div className="flex items-center gap-4">
      <Clock size={16} className={active ? 'text-emerald-400' : 'text-slate-400'} />
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-emerald-400' : 'text-slate-400'}`}>{time}</p>
        <p className="font-bold truncate">{name}</p>
        <p className={`text-[9px] font-black uppercase tracking-widest opacity-60`}>{type}</p>
      </div>
      <ChevronRight size={16} className={active ? 'text-emerald-400' : 'text-slate-300'} />
    </div>
  </div>
);

const PatientRow = ({ name, dosha, date, status }: any) => (
  <tr className="hover:bg-slate-50/80 transition-all group">
    <td className="px-10 py-8 font-black text-slate-800 text-sm">{name}</td>
    <td className="px-10 py-8">
      <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-all">{dosha}</span>
    </td>
    <td className="px-10 py-8 text-rose-500 font-bold text-xs flex items-center gap-2">
      <AlertCircle size={14} className="opacity-60" /> {date}
    </td>
    <td className="px-10 py-8 text-center">
      <button className="px-6 py-2.5 bg-teal-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-sm hover:shadow-lg transition-all flex items-center gap-2 mx-auto">
        {status} <ChevronRight size={12} />
      </button>
    </td>
  </tr>
);

export default DoctorDashboard;
