const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/shifts/:year/:month
// @desc    Get all shifts for a month
// @access  Private
router.get('/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const shifts = await Shift.find({
      user: req.user._id,
      year: parseInt(year),
      month: parseInt(month),
    }).sort({ day: 1 });

    // Build summary
    let totalEarnings = 0, workDays = 0, offDays = 0;
    let dayCount = 0, nightCount = 0, bothCount = 0;

    shifts.forEach(s => {
      totalEarnings += s.earnings;
      if (s.shift === 'Off') offDays++;
      else {
        workDays++;
        if (s.shift === 'Day') dayCount++;
        else if (s.shift === 'Night') nightCount++;
        else if (s.shift === 'Both') bothCount++;
      }
    });

    res.json({
      success: true,
      data: shifts,
      summary: { totalEarnings, workDays, offDays, dayCount, nightCount, bothCount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/shifts
// @desc    Create or update a shift (upsert by day)
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { year, month, day, shift } = req.body;

    if (!year || month === undefined || !day || !shift) {
      return res.status(400).json({ success: false, message: 'Please provide year, month, day, and shift' });
    }

    const date = new Date(year, month, day);

    const existing = await Shift.findOne({ user: req.user._id, year, month, day });

    let result;
    if (existing) {
      existing.shift = shift;
      existing.date = date;
      await existing.save();
      result = existing;
    } else {
      result = await Shift.create({ user: req.user._id, year, month, day, date, shift });
    }

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/shifts/:year/:month/:day
// @desc    Delete a shift entry
// @access  Private
router.delete('/:year/:month/:day', async (req, res) => {
  try {
    const { year, month, day } = req.params;
    const shift = await Shift.findOneAndDelete({
      user: req.user._id,
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    res.json({ success: true, message: 'Shift deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/shifts/summary/all
// @desc    Get yearly summary grouped by month
// @access  Private
router.get('/summary/all', async (req, res) => {
  try {
    const summary = await Shift.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalEarnings: { $sum: '$earnings' },
          totalDays: { $sum: 1 },
          workDays: {
            $sum: { $cond: [{ $ne: ['$shift', 'Off'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
