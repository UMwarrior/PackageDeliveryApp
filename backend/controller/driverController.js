const { generateDriverToken, generateDriverOtpToken } = require('../auth/driverAuth');
const db = require('../db/connection');
const { sendOtp, verifyOtp } = require('../services/otpService');
const { isValidPhoneNumber, isValidOTP, isValidZipcode } = require('../validator/validator');

async function requestOtp(req, res) {
    const { phone } = req.body;

    if (!phone && !isValidPhoneNumber(phone)) {
        res.status(400).json({ error: 'Invalid phone number' });
        return
    }

    try {
        await sendOtp(phone);
        res.json({ message: "OTP Sent successfully" })
    } catch (error) {
        res.status(error.status).json({ message: error })
    }
}

async function checkOtp(req, res) {
    const { phone, otp } = req.body;

    if (!phone && !isValidPhoneNumber(phone)) {
        res.status(400).json({ error: 'Invalid phone number' });
        return
    }
    if (!otp && !isValidOTP(otp)) {
        res.status(400).json({ error: 'Invalid OTP' });
        return
    }

    try {
        const message = await verifyOtp(phone, otp);

        if (message === "approved") {
            const results = await checkDriver(phone);
            res.json(results);
        } else {
            res.status(403).json({ error: "Invalid OTP" });
            return
        }
    } catch (error) {
        res.status(error.status).json({ error: error })
    }
}

async function checkDriver(phone) {
    try {
        const results = await getDriverByPhone(phone)
        if (results && results.status == 1) {
            const status = 1;
            const message = "Login Successfully";
            const token = generateDriverToken(results.id);
            return { status, message, token }
        } else if (results && results.status == 2) {
            const status = 2;
            const message = "OTP Verified , Please send your details now.";
            const token = generateDriverOtpToken(phone);
            return { status, message, token }
        }
        else {
            return { error: "something went wrong" }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

async function registerDriver(req, res) {
    const { name, country, state, city, zipcode, phone } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Invalid name' });
    }
    if (!country || country.trim() === '') {
        return res.status(400).json({ error: 'Invalid country' });
    }
    if (!state || state.trim() === '') {
        return res.status(400).json({ error: 'Invalid state' });
    }
    if (!city || city.trim() === '') {
        return res.status(400).json({ error: 'Invalid city' });
    }
    if (!zipcode || !isValidZipcode(zipcode)) {
        return res.status(400).json({ error: 'Invalid zipcode' });
    }

    const results = await getDriverByPhone(phone)
    if (results && results.status == 1) {
        return res.status(400).json({ error: "Phone number already registered" });
    }

    try {
        const results = await db.query('INSERT INTO driver (name, phone, country , state , city , zipcode) VALUES (?, ?, ? ,? , ? ,?)', [name, phone, country, state, city, zipcode]);
        if (results) {
            const token = generateDriverToken(results[0].insertId);
            res.json({ message: "Account created successfully" , token });
            return
        } else {
            return res.status(400).json({ error: "Something Went wrong" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
}

async function driverDetails(req , res){
    const { driveId } = req.body;
    try {
        const results = await getDriverById(driveId)
        if (results && results.status == 1) {
            res.json( {driver:results })
        } else if (results && results.status == 2) {
            res.json( {error: "Please Register first"})
        }
        else {
            return { error: "something went wrong" }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

async function getDriverById(id) {
    try {
        const results = await db.query('SELECT * FROM driver where id = ?', [id])
        if (results[0].length > 0) {
            results[0][0].status = 1;
            return results[0][0];
        } else if (results[0].length == 0) {
            results[0].status = 2;
            return results[0]
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return null
    }
}

async function getDriverByPhone(phone) {
    try {
        const results = await db.query('SELECT * FROM driver where phone = ?', [phone])
        if (results[0].length > 0) {
            results[0][0].status = 1;
            return results[0][0];
        } else if (results[0].length == 0) {
            results[0].status = 2;
            return results[0]
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return null
    }
}


module.exports = { requestOtp, checkOtp, registerDriver ,driverDetails }