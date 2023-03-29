const express = require("express");
const routes = express.Router();
const userController = require("../controllers/userController")
const verifyToken = require("../middleware/verifyToken");

routes.use(verifyToken);

routes.route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = routes;