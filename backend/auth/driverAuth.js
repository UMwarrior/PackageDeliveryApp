const jwt = require('jsonwebtoken');

const generateDriverToken = (driveId) => {
    const driver = 1;
    const token = jwt.sign({ driveId, driver }, '12345678', { expiresIn: '10h' }); // Replace 'your_secret_key'
    return token;
};

const generateDriverOtpToken = (phone) => {
    const driver = 1;
    const token = jwt.sign({ phone, driver }, '12345678', { expiresIn: '10h' }); // Replace 'your_secret_key'
    return token;
};


module.exports = { generateDriverToken ,generateDriverOtpToken };