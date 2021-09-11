require("dotenv").config();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const Member = require("../models/member");
const Message = require("../models/message");

exports.profile_get = async function (req, res, next) {
  if (!res.locals.currentUser) res.redirect("/");

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
    res.redirect("/");
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
      // TODO
      // check if user already exists
      // messages page not updating username

      // create new user
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return next(err);

        const member = new Member({
          username: req.body.username,
          password: hash,
          member: true,
          avatar: req.body.avatar,
          admin: req.user.admin,
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
