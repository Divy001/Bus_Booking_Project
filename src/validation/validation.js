const validator = require("email-validator");

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}

const isValidMobileNum = function (value) {
    if (!(/^(\+\d{1,3}[- ]?)?\d{10}$/.test(value.trim()))) {
        return false
    }
    return true
}

const isValidSyntaxOfEmail = function (value) {
    if (!(validator.validate(value.trim()))) {
        return false
    }
    return true
}

const checkUser = async (req, res, next) => {
    try {
        const registration = req.body;
        const { title, first_Name, last_name, email, mobile, password } = registration;
        if (!isValidRequestBody(registration)) {
            return res.status(400).send({ status: false, msg: "Please provide the mendatory field to Register" });
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Please provide Your title" });
        }
        if (!isValid(first_Name)) {
            return res.status(400).send({ status: false, msg: "Please provide Your first_Name" });
        }
        if (!isValid(mobile)) {
            return res.status(400).send({ status: false, msg: "Please provide your mobile number" });
        }
        if (!isValidMobileNum(mobile)) {
            return res.status(400).send({ status: false, msg: 'Please provide a valid Mobile number.' })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "Please provide Your Email Id" });;
        }
        if (!isValidSyntaxOfEmail(email)) {
            return res.status(404).send({ status: false, msg: "Please provide a valid Email Id" });
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });;
        }
        let size = Object.keys(password.trim()).length
        if (size < 8 || size > 15) {
            return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 14 characters" });;
        }
        next()
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

const checkUserupdate = async (req, res, next) => {
    try {
        let myData = req.body.data
        if (!myData) {
            return res.status(400).send({ status: false, message: "Please provide data to update" });
        }
        let paramsId = req.params.userId
        let checkId = ObjectId.isValid(paramsId);
        if (!checkId) {
            return res.status(400).send({ status: false, message: "Please Provide a valid userId in path params" });;
        }
        if (!(req.userId == paramsId)) {
            return res.status(400).send({ status: false, message: "Sorry you are not authorized to do this action" })
        }
        if (!isValidRequestBody(userBody)) {
            return res.status(400).send({ status: false, message: "Please provide data to update" });
        }
        let { first_Name, last_name, email, mobile, password } = userBody;
        if (!isKeyPresent(first_Name)) {
            return res.status(400).send({ status: false, message: "Please provide first_Name" });
        }
        if (!isAlphabet(first_Name)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in first_Name" });
        }
        if (!isKeyPresent(last_name)) {
            return res.status(400).send({ status: false, message: "Please provide last_name" });
        }
        if (!isAlphabet(last_name)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in last_name" });
        }
        if (!isKeyPresent(email)) {
            return res.status(400).send({ status: false, message: "Please provide email" });
        }
        if (email) {
            if (!isValidSyntaxOfEmail(email)) {
                return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
            }
        }
        if (!isKeyPresent(mobile)) {
            return res.status(400).send({ status: false, message: "Please provide email" });
        }
        if (mobile) {
            if (!isValidMobileNum(mobile)) {
                return res.status(400).send({ status: false, message: 'Please provide a valid mobile number' })
            }
        }
        if (!isKeyPresent(password)) {
            return res.status(400).send({ status: false, message: "Please provide password" });
        }
        if (password) {
            let size = Object.keys(password.trim()).length
            if (size < 8 || size > 15) {
                return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 14 characters" });;
            }
        }
        const foundId = await userModel.findOne({ email: email });
        if (foundId) {
            let userId1 = foundId._id
            if (userId1 == paramsId) { // here we are checking that if we are the owner of duplicate id then still we are able to update
                const duplicatemobile1 = await userModel.findOne({ mobile: mobile })
                if (duplicatemobile1) {
                    let userId2 = duplicatemobile1._id
                    if (userId2 == paramsId) {
                        return next();
                    } else if (duplicatemobile1) {
                        return res.status(400).send({ status: false, message: "This mobile number already exists with another user(1)" });
                    }
                } else {
                    return next();
                }
            }
        }
        const foundId1 = await userModel.findOne({ mobile: mobile });
        if (foundId1) {
            let userId3 = foundId1._id
            if (userId3 == paramsId) { // here we are checking that if we are the owner of duplicate id then still we are able to update
                const duplicateEmail1 = await userModel.findOne({ email: email })
                if (duplicateEmail1) {
                    let userId2 = duplicateEmail1._id
                    if (userId2 == paramsId) {
                        return next();
                    } else if (duplicateEmail1) {
                        return res.status(400).send({ status: false, message: "This email Id is already exists with another user(1)" });
                    }
                } else {
                    return next();
                }
            }
        }
        const DuplicateEmail = await userModel.find({ email: email });
        const emailFound = DuplicateEmail.length;
        if (emailFound != 0) {
            return res.status(400).send({ status: false, message: "This email Id already exists with another user(2)" });
        }
        const duplicatemobile = await userModel.findOne({ mobile: mobile })
        if (duplicatemobile) {
            return res.status(400).send({ status: false, message: "This mobile number already exists with another user(2)" });
        }
        next();
    }
    catch (err) {
        res.status(500).send(err.message)
    }
}

const checkBooking = async (req, res, next) => {
    try {
        const booking = req.body;
        const { journey_Date, from, to, bus_Number, passenger_details, mobile, address, paymentBy } = booking;
        if (!isValidRequestBody(booking)) {
            return res.status(400).send({ status: false, msg: "Please provide details for booking" });
        }
        if (!isValid(from)) {
            return res.status(400).send({ status: false, msg: "Please provide from where your have to take bus" });
        }
        if (!isValid(to)) {
            return res.status(400).send({ status: false, msg: "Please provide your destination" });
        }
        if (from === to) {
            return res.status(400).send({ status: false, msg: "Source and Destination can't be same" });
        }
        if (!isValid(passenger_details)) {
            return res.status(400).send({ status: false, msg: "Please provide passenger details" });
        }
        if (!isValid(mobile)) {
            return res.status(400).send({ status: false, msg: "Please provide your mobile number" });
        }
        if (!isValidMobileNum(mobile)) {
            return res.status(400).send({ status: false, msg: 'Please provide a valid Mobile number.' })
        }
        if (!isValid(address)) {
            return res.status(400).send({ status: false, msg: "Please provide address" });;
        }
        next();
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    isValid,
    isValidRequestBody,
    isValidSyntaxOfEmail,
    isValidMobileNum,
    checkUser,
    checkBooking,
    checkUserupdate
}