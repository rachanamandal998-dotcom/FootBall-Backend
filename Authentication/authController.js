const jwt = require("jsonwebtoken");
exports.login = (req, res) => {
  if (req.body.password !== process.env.ADMIN_PASS)
    return res.status(401).json({ msg: "Wrong password" });
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
};
