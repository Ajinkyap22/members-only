var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");
const messageController = require("../controllers/messageController");
const memberController = require("../controllers/memberController");
const Message = require("../models/message");

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    const messages = await Message.find()
      .sort([["timestamp", "descending"]])
      .populate("member");

    res.render("index", {
      title: "Members Only",
      user: res.locals.currentUser,
      messages,
    });
  } catch (err) {
    return next(err);
  }
});

// AUTH ROUTES

// GET for log in
router.get("/login", authController.login_get);
// POST for log in
router.post("/login", authController.login_post);
// GET for sign up
router.get("/signup", authController.signup_get);
// POST for sign up
router.post("/signup", authController.signup_post);
// GET for log out
router.get("/logout", authController.logout_get);

// MESSAGE ROUTES

// GET for create message
router.get("/new-message", messageController.create_message_get);
// POST for create message
router.post("/new-message", messageController.create_message_post);

// MEMBER ROUTES

// GET for member profile
router.get("/profile/:id", memberController.profile_get);
// GET for edit profile
router.get("/edit-profile/:id", memberController.edit_get);
// POST for edit profile
router.post("/edit-profile/:id", memberController.edit_post);

module.exports = router;
