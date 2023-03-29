const User = require("../models/User")
const Note = require("../models/Note")
const asycnHandler = require("express-async-handler");
const bcrypt = require("bcrypt")

const getAllUsers = asycnHandler(async (req, res) => {
  const users = await User.find()
    .select("-password")
    .lean()
  if (!users?.length) {
    return res.status(400).json({message: "User not found"})
  }
  res.json(users);
})


const createUser = asycnHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  // Confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ messange: "All field are required" })
  }

  // Check for duplicates 
  const duplicate = await User.findOne({ username })
    .lean()
    .exec()
  
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10) // salt rounds
  const userObject = { username, "password": hashedPassword, roles }
  
  // Create and store a new user
  const user = await User.create(userObject)
  if (user) {
    res.status(201).json({ message: `New user ${username} has been created` })
  } else {
    res.status(400).json({ message: "Invalid user data received" })
  }

})


const updateUser = asycnHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (!id || !username || !Array.isArray(roles) || !roles.length ||
    typeof active !== "boolean") {
    res.status(400).json({ message: "All fields are required" })
  }

  const user = await User.findById(id).exec()

  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  // Check for duplicate 
  const duplicate = await User.findOne({ username })
    .lean()
    .exec()

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ messange: "User alredy exist" })
  }

  // Update data
  user.username = username;
  user.roles = roles;
  user.active = active

  if (password) {
    user.password = await bcrypt.hash(password, 10)
  }

  const updatedUser = await user.save()
  res.json({ message: `${updatedUser.username} has been updated` })
})


const deleteUser = asycnHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" })
  }

  const note = await Note.findOne({ user: id }).lean().exec()
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" })
  }

  const user = await User.findById(id).exec()
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const result = await user.deleteOne()

  const reply = `Username ${result.username} with the ID ${result._id} deleted`;
  res.json(reply)

})

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
}