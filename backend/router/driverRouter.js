const express = require("express");

const router = express.Router();

const { requestOtp, checkOtp, registerDriver, driverDetails, getAssignedOrders, startOrder, completeOrder } = require("../controller/driverController");
const { authenticateDriver, authenticateOtpDriver } = require("../middleware/driverMiddleware");

router.get("/test", () => {
    console.log("test");
})
router.get("/sendotp", requestOtp)
router.get("/verifyotp", checkOtp)
router.post("/register", authenticateOtpDriver, registerDriver)
router.post("/details", authenticateDriver, driverDetails)
router.get("/assignedorders", authenticateDriver, getAssignedOrders)
router.get("/startorder", authenticateDriver, startOrder)
router.get("/completeorder", authenticateDriver, completeOrder)

module.exports = router