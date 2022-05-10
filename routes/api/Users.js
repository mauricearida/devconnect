const router = require("express").Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const passport = require("passport");

// Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
//router.get("/", (req, res) => res.json());

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ email: req.body.email });
  const user1 = await User.findOne({ name: req.body.name });

  if (user) {
    errors.email = "Email already exists";
    res.status(401).json(errors);
  } else if (user1) {
    res.status(401).json("Name already exits");
  } else {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SEC
      ).toString(),
    });

    try {
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  }
});

// @route   GET api/users/login
// @desc    Login user / Returning token
// @access  Public

router.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      errors.email = "User not found";
      res.status(401).json(errors);
    } else if (!req.body.password) {
      res.status(401).json("Insert password");
    } else {
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_SEC
      );
      const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
      if (OriginalPassword !== req.body.password) {
        errors.password = "Password incorrect";
        res.status(401).json(errors);
      } else if (OriginalPassword === req.body.password) {
        //   const payload = { id: user.id, name: user.name, avatar: user.avatar }; // Create JWT Payload
        const accessToken = jwt.sign(
          {
            id: user._id,
            isAdmin: user.isAdmin,
          },
          process.env.JWT_SEC,
          { expiresIn: "3d" }
        );
        const { password, ...others } = user._doc;

        res.status(200).json({ ...others, accessToken });
      }
    }
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
    return;
  }
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ msg: "Success" });
  }
);

module.exports = router;
