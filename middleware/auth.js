const jwt = require("jsonwebtoken");
const JWT_SECRET = "YOUR_SECRET_KEY";

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user; // يحفظ بيانات المستخدم
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
}

module.exports = { authenticate, isAdmin };
