const express = require("express");

const router = express.Router();

const { requestOtp, checkOtp, registerUser, userDetails, placeOrder, getPendingOrders, getAcceptedOrders, getRejectedOrders, getOrderDetails } = require("../controller/userController");
const { authenticateUser , authenticateOtpUser } = require("../middleware/userMiddleware");

router.get("/test", () => {
    console.log("test");
})
router.get("/sendotp", requestOtp)
router.get("/verifyotp", checkOtp)
router.post("/register", authenticateOtpUser, registerUser)
router.post("/details", authenticateUser, userDetails)
router.post("/placeorder", authenticateUser, placeOrder)
router.get("/pendingorders", authenticateUser, getPendingOrders)
router.get("/acceptedorders", authenticateUser, getAcceptedOrders)
router.get("/rejectedorders", authenticateUser, getRejectedOrders)
router.get("/orderdetails", authenticateUser, getOrderDetails)

module.exports = router