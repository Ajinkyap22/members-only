require("dotenv").config();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const Member = require("../models/member");
const Message = require("../models/message");

exports.profile_get = async function (req, res, next) {
  if (!res.locals.currentUser) res.redirect("/login");

  try {
    const messages = await Message.find({ member: req.user._id })
      .sort([["timestamp", "descending"]])
      .populate("member");

    res.render("profile", {
      title: "Member Profile",
      user: res.locals.currentUser,
      messages,
    });
  } catch (err) {
    return next(err);
  }
};

exports.edit_get = function (req, res) {
  if (!res.locals.currentUser) {
    res.redirect("/login");
  }

  res.render("signup_form", {
    title: "Edit Profile",
    user: res.locals.currentUser,
    isUpdating: true,
  });
};

exports.edit_post = [
  // sanitize and validate fields
  body("username", "Username must be at least 3 characters long.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("password", "Password must be at least 3 characters long.")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body("confirmPassword", "Password must be at least 3 characters long.")
    .trim()
    .isLength({ min: 6 })
    .escape()
    .custom(async (value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Cnofirmed Password must be the same as password");
      return true;
    }),

  // process request
  async (req, res, next) => {
    // extract errors
    const errors = validationResult(req.body);

    // re-render if errors
    if (!errors.isEmpty()) {
      res.render("signup_form", {
        title: "Edit Profile",
        errors: errors.array(),
        isUpdating: true,
      });
    }

    if (!req.body.avatar) {
      req.body.avatar = req.user.avatar;
    }

    try {
      // check if user already exists
      if (req.body.username !== req.user.username) {
        const userExists = await Member.find({ username: req.body.username });
        if (userExists.length > 0) {
          return res.render("signup_form", {
            title: "Edit Profile",
            error: "Username already exists",
            isUpdating: true,
            user: res.locals.currentUser,
          });
        }
      }

      // check if passwords match
      if (req.body.password !== req.body.confirmPassword) {
        return res.render("signup_form", {
          title: "Edit Profile",
          error: "Confirmed Password must be the same as password.",
          isUpdating: true,
          user: res.locals.currentUser,
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
          admin: req.user.admin,
          _id: req.user._id,
        });

        Member.findByIdAndUpdate(req.user._id, member, {}, function (err) {
          if (err) return next(err);

          res.redirect(`/profile/${req.user._id}`);
        });
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.admin_form_get = function (req, res) {
  if (!res.locals.currentUser) res.redirect("/login");

  res.render("admin_form", {
    title: "Become an admin",
    user: res.locals.currentUser,
  });
};

exports.admin_form_post = [
  // sanitize and validate
  body("secretPhrase", "Incorrect Secret Phase")
    .trim()
    .isLength({ min: 6 })
    .escape(),

  // process request
  (req, res, next) => {
    // extract errors
    const errors = validationResult(req.body);

    if (req.body.secretPhrase !== process.env.SECRET_PHRASE) {
      return res.render("admin_form", {
        title: "Become an admin",
        user: res.locals.currentUser,
        error: "Incorect phrase. You failed the test.",
      });
    }

    // re-render if errors
    if (!errors.isEmpty()) {
      return res.render("admin_form", {
        title: "Become an admin",
        user: res.locals.currentUser,
        errors: errors.array(),
      });
    }

    // update member
    Member.findByIdAndUpdate(
      req.user._id,
      { $set: { admin: true } },
      {},
      function (err) {
        if (err) return next(err);

        res.redirect(`profile/${req.user._id}`);
      }
    );
  },
];
