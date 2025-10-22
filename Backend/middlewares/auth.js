const { getuser } = require("../services/auth");

function requireAuth() {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Authentication required" });

    const token = authHeader.split(" ")[1]; // expects "Bearer <token>"
    if (!token) return res.status(401).json({ error: "Invalid token" });

    try {
      const tokenvalues = getuser(token);
      req.user = tokenvalues;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}


module.exports = { requireAuth };