const { generateAdminToken } = require('../auth/adminAuth');
const db = require('../db/connection');
const { isNumeric } = require('../validator/validator');

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || username.trim() === '') {
            return res.status(400).json({ error: 'Invalid Username' });
        }
        if (!password || password.trim() === '') {
            return res.status(400).json({ error: 'Invalid Password' });
        }

        try {
            const results = await db.query('SELECT id FROM admin WHERE username = ? AND password = ?', [username, password]);
            if (results[0].length > 0) {
                const token = generateAdminToken();
                res.json({ message: 'Admin authenticated successfully', token });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(400).json({ error: "Something went wrong" })
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function getPendingOrders(req, res) {

    try {
        const results = await db.query('SELECT id FROM orders WHERE status = 1')
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

async function getAllDrivers(req, res) {

    try {
        const results = await db.query('SELECT id FROM driver')
        if (results[0].length > 0) {
            const drivers = results[0];
            const numberOfDrivers = results[0].length;
            res.json({ numberOfDrivers, drivers });
            return
        }
        else if (results[0].length == 0) {
            const drivers = {};
            const numberOfDrivers = 0;
            res.json({ numberOfDrivers, drivers });
            return
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
}

async function getOrderDetails(req, res) {
    const { order_id } = req.body;

    if (!order_id || !isNumeric(order_id)) {
        return res.status(400).json({ error: 'Invalid Order Id' });
    }

    try {
        const results = await db.query('SELECT * FROM orders WHERE id = ?', [order_id])
        if (results[0].length > 0) {
            const orderStatus = results[0];
            res.json({ orderStatus });
        }
        else if (results[0].length == 0) {
            res.json({ error: "Order Id Not Found" });
        }
    } catch (error) {
        return res.status(400).json({ error });
    }
}

async function acceptOrder(req, res) {
    let { order_id ,driver_id } = req.body;

    if (!order_id || !isNumeric(order_id)) {
        return res.status(400).json({ error: 'Invalid Order Id' });
    }

    if (!driver_id || !isNumeric(driver_id) || !await isValidDriver(driver_id)) {
        return res.status(400).json({ error: 'Invalid Driver Id' });
    }

    const order_status = await orderStatusById(order_id);

    if (order_status == -1) {
        res.status(400).json({ error: "Order Id Not Found" });
        return
    }

    if (order_status != 1) {
        res.status(400).json({ error: "Order is Not in Pending state" });
        return
    }

    try {
        const results = await db.query('UPDATE orders SET status = ? , driver_id = ? WHERE id = ?', [ 2, driver_id , order_id]);

        if (results[0].affectedRows > 0) {
            res.json({ message: "Order Accepted Succefully" });
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

async function rejectOrder(req, res) {
    let { order_id , feedback } = req.body;

    if (!order_id || !isNumeric(order_id)) {
        return res.status(400).json({ error: 'Invalid Order Id' });
    }

    if (!feedback || feedback.trim() === '') {
        return res.status(400).json({ error: 'Invalid Feedback' });
    }

    const order_status = await orderStatusById(order_id);

    if (order_status == -1) {
        res.status(400).json({ error: "Order Id Not Found" });
        return
    }

    if (order_status != 1) {
        res.status(400).json({ error: "Order is Not in Pending state" });
        return
    }

    try {
        const results = await db.query('UPDATE orders SET status = ? , feedback = ? WHERE id = ?', [ 3, feedback , order_id]);

        if (results[0].affectedRows > 0) {
            res.json({ message: "Order Rejected Succefully" });
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

async function updateOrderStatus(order_id, new_order_status) {
    try {
        const results = await db.query('UPDATE orders SET status = ? WHERE id = ?', [new_order_status, order_id]);

        if (results[0].affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

async function isValidDriver(driver_id) {
    try {
        const results = await db.query('SELECT id FROM driver WHERE id = ?', [driver_id]);

        if (results[0].length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
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





module.exports = { login, getPendingOrders, getOrderDetails, acceptOrder ,rejectOrder ,getAllDrivers }