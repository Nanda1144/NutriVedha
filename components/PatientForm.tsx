
import React from 'react';
import { useForm } from 'react-hook-form';
import { Patient } from '../types';
import { Save, X } from 'lucide-react';

interface PatientFormProps {
  onSave: (data: Partial<Patient>) => void;
  onCancel: () => void;
  initialData?: Patient;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSave, onCancel, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Patient Registration</h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup label="Full Name" error={errors.name?.message}>
            <input 
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. John Doe"
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Age" error={errors.age?.message}>
              <input 
                type="number"
                {...register('age', { required: 'Age is required' })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              />
            </FormGroup>
            <FormGroup label="Gender">
              <select 
                {...register('gender')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormGroup>
          </div>

          <FormGroup label="Primary Dosha Imbalance">
            <div className="flex gap-4">
              {['Vata', 'Pitta', 'Kapha'].map(d => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value={d.toLowerCase()} {...register('dosha')} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm font-medium">{d}</span>
                </label>
              ))}
            </div>
          </FormGroup>

          <FormGroup label="Water Intake (Daily)">
            <input 
              {...register('waterIntake')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. 2-3 Liters"
            />
          </FormGroup>

          <FormGroup label="Health Conditions (Comma separated)">
            <textarea 
              {...register('healthConditions')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              rows={3}
            />
          </FormGroup>

          <FormGroup label="Dietary Habits">
             <select 
                {...register('dietaryHabits')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
              </select>
          </FormGroup>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-8 py-3 rounded-xl font-bold text-white ayur-gradient shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Save size={20} />
            Save Patient
          </button>
        </div>
      </form>
    </div>
  );
};

const FormGroup = ({ label, children, error }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700">{label}</label>
    {children}
    {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
  </div>
);

export default PatientForm;
