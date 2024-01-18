const express = require("express");
const { login, getPendingOrders, getOrderDetails, acceptOrder, rejectOrder, getAllDrivers } = require("../controller/adminController");
const { authenticateAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/login", login)
router.get("/pendingorders", authenticateAdmin , getPendingOrders)
router.get("/orderdetails", authenticateAdmin , getOrderDetails)
router.get("/acceptorder", authenticateAdmin , acceptOrder)
router.get("/rejectorder", authenticateAdmin , rejectOrder)
router.get("/alldrivers", authenticateAdmin , getAllDrivers)

module.exports = router