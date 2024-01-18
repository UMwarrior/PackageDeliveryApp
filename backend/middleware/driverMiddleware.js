const jwt = require('jsonwebtoken');

const authenticateDriver = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Missing Token' });
  }

  jwt.verify(token, '12345678', (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
      }
      if (decoded.driver !== 1 || !decoded.driverId) {
          return res.status(403).json({ message: 'Forbidden - Access Denied' });
      }

      req.body.driverId = decoded.driverId;
      next();
  });
};

const authenticateOtpDriver = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Missing Token' });
  }

  jwt.verify(token, '12345678', (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
      }

      if (decoded.driver !== 1 || !decoded.phone) {
          return res.status(403).json({ message: 'Forbidden - Access Denied' });
      }

      req.body.phone = decoded.phone;
      next();
  });
};

module.exports = { authenticateDriver ,authenticateOtpDriver };