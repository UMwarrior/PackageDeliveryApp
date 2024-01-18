const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Missing Token' });
    }

    jwt.verify(token, '12345678', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
        }

        if (decoded.admin !== 1) {
            return res.status(403).json({ message: 'Forbidden - Access Denied' });
        }

        next();
    });
};

module.exports = {authenticateAdmin}
