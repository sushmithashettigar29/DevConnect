const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debugging
    req.userId = decoded.id; // Attach userId to the request object
    next();
  } catch (error) {
    console.log("Token verification error:", error); // Debugging
    res.status(400).json({ message: "Invalid token" });
  }
};
