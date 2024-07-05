const User = require("../models/userModel");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

// @desc     SignUp User
// @route    POST /api/users/signup
// @access   Public
exports.signUp = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email: email });

    if (user) {
      res.status(400).json({ msg: "User already exists" });
    }

    const avatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm",
    });

    user = new User({
      name,
      email,
      password,
      avatar,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// @desc     SignIn User
// @route    POST /api/users/signin
// @access   Public
exports.signIn = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email: email });

    if (!user) {
      res.status(400).json({ msg: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ msg: "Invalid email or password" });
    }

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

exports.getMe = asyncHandler(async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user.id).select("-password");

    res.status(200).json(loggedInUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
