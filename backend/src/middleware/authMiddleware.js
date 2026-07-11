import jwt from "jsonwebtoken";

// Middleware to authenticate JWT token and attach user to req
export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "No token provided, authorization denied",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded; // Contains id, email, role
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Token is not valid or has expired",
      error: error.message,
    });
  }
};

// Middleware to check user role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized, user not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: false,
        message: `Forbidden: Access restricted to roles: [${allowedRoles.join(", ")}]`,
      });
    }

    next();
  };
};
