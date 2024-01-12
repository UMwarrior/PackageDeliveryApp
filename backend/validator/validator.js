function isValidZipcode(zipcode) {
    return /^\d+$/.test(zipcode);
}

function isValidPhoneNumber(phoneNumber) {
    return /^\+\d+$/.test(phoneNumber);
}

function isValidOTP(otp) {
    return /^\d{6}$/.test(otp);
}

module.exports = {isValidOTP , isValidPhoneNumber , isValidZipcode}