const jwt = require('jsonwebtoken');

const generateAdminToken = () => {
    const admin = 1;
    const token = jwt.sign({ admin }, '12345678', { expiresIn: '10h' }); // Replace 'your_secret_key'
    return token;
};

module.exports = {generateAdminToken};