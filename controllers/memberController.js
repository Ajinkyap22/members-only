require("dotenv").config();
const { body, validationResult } = require("express-validator");
const Member = require("../models/member");

exports.edit_get = function (req, res) {
  res.render("profile_edit", { title: "Edit Profile" });
};

// username

// avatar

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
      res.render("profile_edit", {
        title: "Edit Profile",
        errors: errors.array(),
      });
    }

    // create member object
    const member = new Member({
      username: req.body.username,
      password: req.user.password,
      member: true,
      avatar: req.body.avatar,
      admin: req.user.admin,
    });

    // save
    Member.findByIdAndUpdate(req.user._id, member, {}, function (err) {
      if (err) return next(err);

      res.redirect("/");
    });
  },
];
