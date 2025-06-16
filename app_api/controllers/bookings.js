const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Trip = mongoose.model('trips');

// POST /api/bookings
const bookingsCreate = async (req, res) => {
  const { userId, tripId } = req.body;
  if (!userId || !tripId) {
    return res.status(400).json({ error: 'userId and tripId required' });
  }
  try {
    const trip = await Trip.findById(tripId).exec();
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    if (trip.available != null && trip.available < 1) {
      return res.status(400).json({ error: 'Trip is fully booked' });
    }
    const booking = new Booking({ user: userId, trip: tripId });
    const saved = await booking.save();
    if (trip.available != null) {
      trip.available -= 1;
      await trip.save();
    }
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/users/:userId/bookings
const bookingsListByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('trip')
      .exec();
    return res.status(200).json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  bookingsCreate,
  bookingsListByUser
};
