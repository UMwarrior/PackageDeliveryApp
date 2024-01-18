const accountSid = "AC22f1cc79147d4c8c65eb83004b7e2f1e";
const authToken = "c7e8cdaa6c2afa05fb24cfa64122d88a";
const verifySid = "VA86da96a904dc26b2b08db9f64a73af87";
const client = require("twilio")(accountSid, authToken);


async function sendOtp(phone) {
    let result = ""
    await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: phone, channel: "sms" })
        .then((verification) => {
            result = verification
        });
    return result
}

async function verifyOtp(phone, otpCode) {
    let message = "";
    await client.verify.v2.services(verifySid)
        .verificationChecks.create({ to: phone, code: otpCode })
        .then((verification_check) => {
            message =  verification_check.status;
        })
    return message;
}

module.exports = { sendOtp , verifyOtp };

