const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Missing Token' });
    }

    jwt.verify(token, '12345678', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
        }

        if (decoded.user !== 1 || !decoded.userId) {
            return res.status(403).json({ message: 'Forbidden - Access Denied' });
        }

        req.body.userId = decoded.userId;
        next();
    });
};

const authenticateOtpUser = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Missing Token' });
    }

    jwt.verify(token, '12345678', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
        }

        if (decoded.user !== 1 || !decoded.phone) {
            return res.status(403).json({ message: 'Forbidden - Access Denied' });
        }

        req.body.phone = decoded.phone;
        next();
    });
};

module.exports = { authenticateUser, authenticateOtpUser };