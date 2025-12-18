import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user','business','admin'], default: 'user' },

  subscription: {
    plan: { type: String, enum: ['free','pro','business'], default: 'free' },
    expiresAt: { type: Date, default: null },
  },

  apiKey: { type: String,  unique: true },

  avatar: {
    public_id: String,
    url: String,
  },

  monthlyInvoicesParsed: { type: Number, default: 0 },

  notifications: {
    invoiceSummary: { type: Boolean, default: true },
    monthlyReport: { type: Boolean, default: true },
    highExpenseAlerts: { type: Boolean, default: true }
  },

  refreshTokens: [{ token: String, createdAt: Date }], // store refresh tokens hashed (optional)
},
{ timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

// Generate API key
userSchema.methods.generateApiKey = function() {
  const key = crypto.randomBytes(32).toString('hex');
  this.apiKey = key;
  return key;
};

const User = mongoose.model('User', userSchema);
export default User;
