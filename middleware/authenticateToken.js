
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access token is required"
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Access token is required"
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    return res.status(500).json({
      message: "Authentication is not configured correctly"
    });
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: "lumina-api",
      audience: "lumina-client",
      algorithms: ["HS256"]
    });

    req.user = {
      id: Number(decoded.sub),
      role: decoded.role
    };

    if (!Number.isSafeInteger(req.user.id) || req.user.id <= 0) {
      return res.status(401).json({
        message: "Invalid access token"
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired access token"
    });
  }
}

module.exports = authenticateToken;
