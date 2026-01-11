
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Food } from '../types';

interface NutrientAnalyzerProps {
  foods: Food[];
}

const NutrientAnalyzer: React.FC<NutrientAnalyzerProps> = ({ foods }) => {
  const totals = foods.reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    protein: acc.protein + f.protein,
    carbs: acc.carbs + f.carbs,
    fat: acc.fat + f.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const macroData = [
    { name: 'Protein', value: totals.protein * 4, color: '#10b981' },
    { name: 'Carbs', value: totals.carbs * 4, color: '#3b82f6' },
    { name: 'Fat', value: totals.fat * 9, color: '#f59e0b' },
  ];

  // Rasa Analysis
  const rasaCounts: any = {};
  foods.forEach(f => {
    f.rasa.forEach(r => {
      rasaCounts[r] = (rasaCounts[r] || 0) + 1;
    });
  });

  const radarData = Object.keys(rasaCounts).map(r => ({
    subject: r.charAt(0).toUpperCase() + r.slice(1),
    A: rasaCounts[r],
    fullMark: Math.max(...Object.values(rasaCounts) as number[]),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-slate-50 p-6 rounded-2xl">
        <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Macro Distribution (kcal)</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={macroData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around mt-2">
          {macroData.map(m => (
            <div key={m.name} className="text-center">
              <p className="text-xs font-bold text-slate-400">{m.name}</p>
              <p className="text-sm font-bold" style={{color: m.color}}>{Math.round(m.value)} kcal</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl">
        <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Rasa Balance (Quantum Optimized)</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 600, fill: '#64748b'}} />
              <Radar name="Balance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default NutrientAnalyzer;
