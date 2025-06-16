const mongoose = require("mongoose");
const User = require("../models/user");
const passport = require("passport");

const register = async (req, res) => {
  console.log("Register endpoint received body:", req.body);
  const { name, email, password } = req.body;

  // 1) Ensure all three fields are present
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    // 2) Prevent duplicate registration
    const existing = await User.findOne({ email }).exec();
    if (existing) {
      console.log("Email already in use:", email);
      return res.status(400).json({ message: "Email already in use" });
    }

    // 3) Create the user instance and hash the password
    const user = new User({ name, email, hash: "", salt: "" });
    user.setPassword(password);

    // 4) Save the new user to MongoDB
    const savedUser = await user.save();
    if (!savedUser) {
      // Should not normally happen—Mongoose will throw on validation errors
      return res.status(500).json({ message: "Unable to register user" });
    }

    // 5) Generate a JWT for the new user
    const token = savedUser.generateJWT();
    return res.status(200).json({ token });
  } catch (err) {
    console.error("Error in register controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = (req, res) => {
  const { name, email, password } = req.body;

  // 1) Ensure all three fields are present
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  // 2) Delegate authentication to passport (which requires a local strategy that uses validatePassword)
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      // Internal server error
      return res.status(500).json(err);
    }
    if (user) {
      // 3) Auth succeeded, generate and return JWT
      const token = user.generateJWT();
      return res.status(200).json({ token });
    } else {
      // 4) Auth failed (wrong credentials)
      return res.status(401).json(info);
    }
  })(req, res);
};

module.exports = {
  register,
  login,
};