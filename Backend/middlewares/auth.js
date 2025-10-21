const { getuser } = require("../services/auth");

function requireAuth(cookieval) {
  return (req, res, next) => {
    const tokenvalue = req.cookies[cookieval];
    if (!tokenvalue) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const tokenvalues = getuser(tokenvalue);
      req.user = tokenvalues;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = { requireAuth };