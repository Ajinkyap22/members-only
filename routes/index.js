var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Members Only", user: res.locals.currentUser });
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

// MEMBER ROUTES

// GET for create message
// POST for create message

module.exports = router;
