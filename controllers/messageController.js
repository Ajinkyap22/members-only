const { body, validationResult } = require("express-validator");
const Message = require("../models/message");

exports.create_message_get = function (req, res) {
  if (!res.locals.currentUser) res.redirect("/");

  res.render("message_form", {
    title: "New Message",
    user: res.locals.currentUser,
  });
};

exports.create_message_post = [
  // santitze and validate fields
  body("title", "Title Cannot be empty").trim().isLength({ min: 1 }),
  body("message", "Message Cannot be empty").trim().isLength({ min: 1 }),

  // process request
  async (req, res, next) => {
    // extract errors
    const errors = validationResult(req.body);

    // create new message object
    const message = new Message({
      title: req.body.title,
      text: req.body.message,
      timestamp: Date.now(),
      member: res.locals.currentUser._id,
    });

    // re-render if errors
    if (!errors.isEmpty()) {
      return res.render("message_form", {
        title: "New Message",
        user: res.locals.currentUser,
        errors: errors.array(),
      });
    } else {
      // save
      await message.save((err) => {
        if (err) return next(err);

        res.redirect("/");
      });
    }
  },
];
