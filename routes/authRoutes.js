const express = require("express");
const routes = express.Router();
const authController = require("../controllers/authController")
const loginLimiter = require("../middleware/loginLimiter");


routes.route("/")
  .post(loginLimiter, authController.login)

routes.route("/refresh")
  .get(authController.refresh)

routes.route("/logout")
  .post(authController.logout)

module.exports = routes