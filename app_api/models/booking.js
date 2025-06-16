const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  trip: { type: Schema.Types.ObjectId, ref: 'trips', required: true },
  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('bookings', bookingSchema);
