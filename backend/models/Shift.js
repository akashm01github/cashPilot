const mongoose = require('mongoose');

const SHIFT_RATE = 585;

const ShiftSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number, // 0-indexed (0 = January)
    required: true,
  },
  day: {
    type: Number,
    required: true,
  },
  shift: {
    type: String,
    enum: ['Day', 'Night', 'Both', 'Off'],
    required: [true, 'Please provide a shift type'],
  },
  earnings: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Auto-calculate earnings before save
ShiftSchema.pre('save', function (next) {
  if (this.shift === 'Day') this.earnings = SHIFT_RATE;
  else if (this.shift === 'Night') this.earnings = SHIFT_RATE;
  else if (this.shift === 'Both') this.earnings = SHIFT_RATE * 2;
  else this.earnings = 0;
  next();
});

// Compound unique index: one entry per user per day
ShiftSchema.index({ user: 1, year: 1, month: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Shift', ShiftSchema);
