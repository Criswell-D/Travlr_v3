const levenshtein = require('fast-levenshtein');
const mongoose = require("mongoose");
const Trip = require("../models/travlr");
const Model = mongoose.model("trips");

const tripsList = async (req, res) => {
  const q = await Model.find({}) // No filter, return all records
    .exec();

  // console.log(q);

  if (!q) {
    // Database returned no data
    return res.status(404).json(err);
  } else {
    // Return resulting trip list
    return res.status(200).json(q);
  }
};

const tripsFindByCode = async (req, res) => {
  const q = await Model.find({ code: req.params.tripCode }).exec();

  // console.log(q);

  if (!q) {
    // Database returned no data
    return res.status(404).json(err);
  } else {
    // Return resulting trip list
    return res.status(200).json(q);
  }
};

// PUT: /trips/:tripCode - Updates a Trip
// Regardless of outcome, response must include HTML status code
// and JSON message to the requesting client
const tripsUpdateTrip = async (req, res) => {
  console.log(req.params);
  console.log(req.body);
  try {
    const q = await Model.findOneAndUpdate(
      { code: req.params.tripCode },
      {
        code: req.body.code,
        name: req.body.name,
        length: req.body.length,
        start: req.body.start,
        resort: req.body.resort,
        perPerson: req.body.perPerson,
        image: req.body.image,
        description: req.body.description,
      }
    ).exec();

    if (!q) {
      // Database returned no data
      return res.status(404).json({ message: "Trip not found" });
    } else {
      // Return resulting updated trip
      return res.status(200).json(q);
    }

    // Uncomment the following line to show results of operation
    // console.log(q);
  } catch (error) {
    console.error("Error updating trip:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const tripsSearch = async (req, res) => {
  const term = (req.query.q || '').trim().toLowerCase();
  if (!term) {
    return res.status(400).json({ error: 'Missing search parameter `q`.' });
  }

  try {
    // 1. Fetch all trips from Mongo
    const allTrips = await Model.find({}).exec();

    // 2. Substring match first (case-insensitive)
    const substringMatches = allTrips.filter(trip =>
      (trip.name || '').toLowerCase().includes(term)
    );
    if (substringMatches.length > 0) {
      // return plain JSON objects
      return res
        .status(200)
        .json(substringMatches.map(t => t.toObject()));
    }

    // 3. Fuzzy fallback
    const fuzzyResults = allTrips
      .map(trip => {
        const name = (trip.name || '').toLowerCase();
        return {
          trip: trip.toObject(),
          distance: levenshtein.get(name, term),
        };
      })
      // choose a threshold (e.g., up to 50% of the name length)
      .filter(({ trip, distance }) =>
        distance <= Math.ceil((trip.name.length || 0) * 0.5)
      )
      .sort((a, b) => a.distance - b.distance)
      .map(({ trip, distance }) => ({ ...trip, distance }));

    return res.status(200).json(fuzzyResults);
  } catch (err) {
    console.error('Fuzzy search error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const tripsAddTrip = async (req, res) => {
  const newtrip = new Trip({
    code: req.body.code,
    name: req.body.name,
    length: req.body.length,
    start: req.body.start,
    resort: req.body.resort,
    perPerson: req.body.perPerson,
    image: req.body.image,
    description: req.body.description,
  });

  const q = await newtrip.save();

  if (!q) {
    //Database returned no data
    return res.status(400).json(err);
  } else {
    return res.status(201).json(q);
  }
};

module.exports = {
  tripsList,
  tripsFindByCode,
  tripsAddTrip,
  tripsUpdateTrip,
  tripsSearch,
};