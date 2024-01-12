const express = require("express");

const router = express.Router();

const { requestOtp, checkOtp, registerDriver, driverDetails } = require("../controller/driverController");
const { authenticateDriver, authenticateOtpDriver } = require("../middleware/driverMiddleware");

router.get("/test", () => {
    console.log("test");
})
router.get("/sendotp", requestOtp)
router.get("/verifyotp", checkOtp)
router.post("/register", authenticateOtpDriver, registerDriver)
router.post("/details", authenticateDriver, driverDetails)

module.exports = router