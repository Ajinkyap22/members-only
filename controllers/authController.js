require("dotenv").config();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const Member = require("../models/member");

exports.signup_get = function (req, res) {
  res.render("signup_form", { title: "Sign Up" });
};

exports.signup_post = [
  // sanitize and validate fields
  body("username", "Username must be at least 3 characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("password", "Password must be at least 3 characters long.")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body("confirm-password", "Password must be at least 3 characters long.")
    .trim()
    .isLength({ min: 6 })
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Password must be the same");
      return true;
    }),
  body("secretPassword", "This is not the secret password").trim().escape(),

  // process request
  async (req, res, next) => {
    // extract errors
    const errors = validationResult(req.body);

    // re-render form if errors
    if (!errors.isEmpty()) {
      return res.render("signup_form", {
        title: "Sign Up",
        errors: errors.array(),
      });
    }

    try {
      // check if user already exists
      const userExists = await Member.find({ username: req.body.username });
      if (userExists.length > 0) {
        return res.render("signup_form", {
          title: "Sign Up",
          error: "Username already exists",
        });
      }

      // check secret password
      if (req.body.secretPassword !== process.env.SECRET_PASSWORD) {
        return res.render("signup_form", {
          title: "Sign Up",
          error: "Incorrect Secret Password",
        });
      }

      // create new user
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return next(err);

        const member = new Member({
          username: req.body.username,
          password: hash,
          member: true,
          avatar: req.body.avatar,
          admin: false,
        }).save((err) => {
          if (err) return next(err);

          res.redirect("/login");
        });
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.login_get = function (req, res) {
  res.render("login_form", { title: "Log In" });
};

exports.login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
});

exports.logout_get = function (req, res) {
  req.logout();
  res.redirect("/");
  console.log("Logged Out");
};
