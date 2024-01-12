const jwt = require('jsonwebtoken');

const generateUserToken = (userId) => {
    const user = 1;
    const token = jwt.sign({ userId, user }, '12345678', { expiresIn: '10h' }); // Replace 'your_secret_key'
    return token;
};

const generateUserOtpToken = (phone) => {
    const user = 1;
    const token = jwt.sign({ phone, user }, '12345678', { expiresIn: '10h' }); // Replace 'your_secret_key'
    return token;
};

module.exports = { generateUserToken ,generateUserOtpToken };