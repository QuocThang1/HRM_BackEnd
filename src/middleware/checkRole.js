const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({
        EC: -1,
        EM: "Unauthorized: No user information found",
      });
    }

    const userRole = req.staff.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        EC: -2,
        EM: `Forbidden: ${userRole} role is not authorized to access this resource`,
      });
    }

    next();
  };
};

module.exports = checkRole;
