const express = require("express");
const { signup, login, me, logout } = require("./authController");
const { protect } = require("./authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;
