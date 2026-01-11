
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrivedha';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('🌿 NutriVedha Connected to MongoDB Vault'))
  .catch(err => console.error('❌ Connection Failed:', err));

// --- SCHEMAS ---

const SystemConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'global' },
  logoUrl: String,
  demoVideoUrl: String,
  siteName: { type: String, default: 'NutriVedha' },
  maintenanceMode: { type: Boolean, default: false }
});

const SystemConfigModel = mongoose.model('SystemConfig', SystemConfigSchema);

const HealthLogSchema = new mongoose.Schema({
  id: String,
  date: String,
  mood: Number,
  energy: Number,
  sleepQuality: Number,
  vitals: {
    weight: Number,
    bloodPressure: String
  },
  symptoms: [String],
  dietCompliance: Number
});

const PatientSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  name: String,
  age: Number,
  gender: String,
  dosha: [String],
  dietaryHabits: String,
  healthConditions: [String],
  allergies: [String],
  onboarding: {
    healthGoal: String,
    dailyActivity: String,
    workingHours: String,
    currentDiet: String,
    physicalActivityLevel: String,
    sleepHours: Number,
    monthlyBudget: Number,
    preferences: {
      preferredCuisines: [String],
      excludedIngredients: [String]
    }
  },
  currentDietPlan: {
    weeklyPlan: Map,
    summary: String,
    ayurvedaScore: Number,
    quantumBalanceFactor: Number,
    isBudgetFriendly: Boolean,
    recipes: Map
  },
  logs: [HealthLogSchema],
  lastSynced: { type: Date, default: Date.now }
}, { timestamps: true });

const PatientModel = mongoose.model('Patient', PatientSchema);

// --- API ENDPOINTS ---

/**
 * SYSTEM CONFIGURATION ENDPOINTS
 */
app.get('/api/config', async (req, res) => {
  try {
    let config = await SystemConfigModel.findOne({ key: 'global' });
    if (!config) {
      config = await SystemConfigModel.create({ 
        key: 'global', 
        siteName: 'NutriVedha',
        logoUrl: '',
        demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Default placeholder
      });
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Config Retrieval Failed" });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const config = await SystemConfigModel.findOneAndUpdate(
      { key: 'global' },
      { ...req.body },
      { upsert: true, new: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Config Update Failed" });
  }
});

app.post('/api/patient/sync', async (req, res) => {
  const { userId, ...updateData } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing User Identity" });
  try {
    const result = await PatientModel.findOneAndUpdate(
      { userId },
      { ...updateData, lastSynced: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ status: "Synced", lastSynced: result.lastSynced });
  } catch (err) {
    res.status(500).json({ error: "Vault Synchronization Failed" });
  }
});

app.get('/api/patient/:userId', async (req, res) => {
  try {
    const patient = await PatientModel.findOne({ userId: req.params.userId });
    if (!patient) return res.status(404).json({ error: "Profile Not Found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Database Retrieval Error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 NutriVedha Secure Core active on port ${PORT}`);
});
