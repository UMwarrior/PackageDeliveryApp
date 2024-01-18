const { generateUserToken, generateUserOtpToken } = require('../auth/userAuth');
const db = require('../db/connection');
const { sendOtp, verifyOtp } = require('../services/otpService');
const { isValidPhoneNumber, isValidOTP, isValidZipcode, isNumeric } = require('../validator/validator');

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
            const results = await checkUser(phone);
            res.json(results);
        } else {
            res.status(403).json({ error: "Invalid OTP" });
            return
        }
    } catch (error) {
        res.status(error.status).json({ error: error })
    }
}

async function checkUser(phone) {
    try {
        const results = await getUserByPhone(phone)
        if (results && results.status == 1) {
            const status = 1;
            const message = "Login Successfully";
            const token = generateUserToken(results.id);
            return { status, message, token }
        } else if (results && results.status == 2) {
            const status = 2;
            const message = "OTP Verified , Please send your details now.";
            const token = generateUserOtpToken(phone);
            return { status, message, token }
        }
        else {
            return { error: "something went wrong" }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

async function registerUser(req, res) {
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

    const results = await getUserByPhone(phone)
    if (results && results.status == 1) {
        return res.status(400).json({ error: "Phone number already registered" });
    }

    try {
        const results = await db.query('INSERT INTO user (name, phone, country , state , city , zipcode) VALUES (?, ?, ? ,? , ? ,?)', [name, phone, country, state, city, zipcode]);
        if (results) {
            const token = generateUserToken(results[0].insertId);
            res.json({ message: "Account created successfully", token });
            return
        } else {
            return res.status(400).json({ error: "Something Went wrong" });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
}

async function userDetails(req, res) {
    const { userId } = req.body;
    try {
        const results = await getUserById(userId)
        if (results && results.status == 1) {
            res.json({ user: results })
        } else if (results && results.status == 2) {
            res.json({ error: "Please Register first" })
        }
        else {
            return { error: "something went wrong" }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}


async function getUserById(id) {
    try {
        const results = await db.query('SELECT * FROM user where id = ?', [id])
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

async function getUserByPhone(phone) {
    try {
        const results = await db.query('SELECT * FROM user where phone = ?', [phone])
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

async function placeOrder(req, res) {
    const { userId, pickup_address, drop_address, alternate_phone, length, breadth, weight, type, picture_url } = req.body;

    if (!pickup_address || pickup_address.trim() === '') {
        return res.status(400).json({ error: 'Invalid name' });
    }
    if (!drop_address || drop_address.trim() === '') {
        return res.status(400).json({ error: 'Invalid country' });
    }
    if (!type || type.trim() === '') {
        return res.status(400).json({ error: 'Invalid state' });
    }
    if (!picture_url || picture_url.trim() === '') {
        return res.status(400).json({ error: 'Invalid city' });
    }
    if (!alternate_phone || !isValidPhoneNumber(alternate_phone)) {
        return res.status(400).json({ error: 'Invalid Phone' });
    }
    if (!length || !isNumeric(length)) {
        return res.status(400).json({ error: 'Invalid length' });
    }
    if (!breadth || !isNumeric(breadth)) {
        return res.status(400).json({ error: 'Invalid breadth' });
    }
    if (!weight || !isNumeric(weight)) {
        return res.status(400).json({ error: 'Invalid weight' });
    }

    try {
        const results = await db.query('INSERT INTO orders (user_id , pickup_address, drop_address, alternate_phone, length, breadth , weight ,type , picture_url , status) VALUES (?, ?, ? ,? , ? ,? ,? ,? ,? ,?)', [userId, pickup_address, drop_address, alternate_phone, length, breadth, weight, type, picture_url, 1]);
        if (results) {
            const order_id = results[0].insertId;
            res.json({ message: "Order Placed successfully", order_id });
            return
        } else {
            return res.status(400).json({ error: "Something Went wrong" });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }


}

async function getPendingOrders(req, res) {
    const { userId } = req.body;

    try {
        const results = await db.query('SELECT id FROM orders WHERE user_id = ? and status = 1', [userId])
        if (results[0].length > 0) {
            const pendingOrders = results[0];
            const numberOfPendingOrders = results[0].length;
            res.json({ numberOfPendingOrders, pendingOrders });
            return
        }
        else if (results[0].length == 0) {
            const pendingOrders = {};
            const numberOfPendingOrders = 0;
            res.json({ numberOfPendingOrders, pendingOrders });
            return
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
}

async function getAcceptedOrders(req, res) {
    const { userId } = req.body;

    try {
        const results = await db.query('SELECT id FROM orders WHERE user_id = ? and status = 2', [userId])
        if (results[0].length > 0) {
            const acceptedOrders = results[0];
            const numberOfAcceptedOrders = results[0].length;
            res.json({ numberOfAcceptedOrders, acceptedOrders });
        }
        else if (results[0].length == 0) {
            const acceptedOrders = {};
            const numberOfAcceptedOrders = 0;
            res.json({ numberOfAcceptedOrders, acceptedOrders });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
}

async function getRejectedOrders(req, res) {
    const { userId } = req.body;

    try {
        const results = await db.query('SELECT id FROM orders WHERE user_id = ? and status = 3', [userId])
        if (results[0].length > 0) {
            const rejectedOrders = results[0];
            const numberOfRejectedOrders = results[0].length;
            res.json({ numberOfRejectedOrders, rejectedOrders });
        }
        else if (results[0].length == 0) {
            const rejectedOrders = {};
            const numberOfRejectedOrders = 0;
            res.json({ numberOfRejectedOrders, rejectedOrders });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
}

async function getOrderDetails(req, res) {
    const { userId, order_id } = req.body;

    if (!order_id || !isNumeric(order_id)) {
        return res.status(400).json({ error: 'Invalid Order Id' });
    }

    if (!await checkOrderAccess(userId, order_id)) {
        return res.status(403).json({ error: 'Access Denied' });
    }

    try {
        const results = await db.query('SELECT * FROM orders WHERE user_id = ? and id = ?', [userId , order_id])
        if (results[0].length > 0) {
            const orderStatus = results[0];
            res.json({ orderStatus});
        }
        else if (results[0].length == 0) {
            res.json({error:"Something went wrong"});
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
}

async function checkOrderAccess(userId, order_id) {

    try {
        const results = await db.query('SELECT id FROM orders WHERE id = ? and user_id = ?', [order_id, userId]);
        if (results[0].length > 0) {
            return true;
        } else {
            return false
        }

    } catch (error) {
        return false;
    }
}

async function makePayment(req, res) {
    let { order_id ,userId } = req.body;

    if (!order_id || !isNumeric(order_id)) {
        return res.status(400).json({ error: 'Invalid Order Id' });
    }

    if (!await checkOrderAccess(userId , order_id)) {
        return res.status(400).json({ error: 'Access Denied' });
    }

    const order_status = await orderStatusById(order_id);

    if (order_status == -1) {
        res.status(400).json({ error: "Order Id Not Found" });
        return
    }

    if (order_status < 2) {
        res.status(400).json({ error: "Order is Not Accepted" });
        return
    }

    if (order_status >= 4) {
        res.status(400).json({ error: "Payment Already Done" });
        return
    }

    try {
        const results = await db.query('UPDATE orders SET status = ?  WHERE id = ?', [ 4 , order_id]);

        if (results[0].affectedRows > 0) {
            res.json({ message: "Payment Done Successfully" });
            return
        } else {
            res.status(400).json({ error: "Something went wrong" });
            return
        }

    } catch (error) {
        res.status(400).json({ error });
        return
    }
}

async function orderStatusById(order_id) {

    try {
        const results = await db.query('SELECT status FROM orders WHERE id = ?', [order_id])
        if (results[0].length > 0) {
            return results[0][0].status;
        }
        else if (results[0].length == 0) {
            return -1
        }
    } catch (error) {
        return -1;
    }

}

module.exports = { requestOtp, checkOtp, registerUser, userDetails, placeOrder, getPendingOrders, getAcceptedOrders, getRejectedOrders ,getOrderDetails ,makePayment }