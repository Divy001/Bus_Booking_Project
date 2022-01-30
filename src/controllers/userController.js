const userModel = require("../models/userModel");
const validateBody = require('../validation/validation');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotnev = require("dotenv")
dotnev.config({ path: "./.env" })
const ObjectId = require('mongoose').Types.ObjectId;

const registerUser = async (req, res) => {
  try {
    let { title, first_Name, last_Name, email, mobile, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const userData = { title, first_Name, last_Name, email, mobile, password }
    const dataCreated = await userModel.create(userData);
    if (dataCreated) {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "devilseye2559@gmail.com",
          pass: process.env.MYPASS
        },
      });
      let info = await transporter.sendMail({
        from: 'devilseye2559@gmail.com',
        to: email,
        subject: "Verification mail by Divy for testing api",
        text: `Message: Please click on given link for successful verification,
                     Link - http://localhost:3000/yourverification?email=${email}`,
      });
      if (info) {
        return res.status(200).send({ status: true, message: "We have sent a verification link to your given email address ,Please click on that link for succcessful registration" })
      }
    }
  }
  catch (err) {
    res.status(500).send(err.message)
  }
}

const userVerifier = async (req, res) => {
  try {
    let mailFound = req.query.email
    let updateProfile = await userModel.findOneAndUpdate({ email: mailFound }, { $unset: { expireTime: "none" }, isVerified: true }, { new: true })
    return res.status(201).send({ status: true, message: "Congratulations Your have registered and verified successfully", Welcome: "Registered successfully, Thanks to become a part of our family", details: updateProfile })
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const userLogin = async (req, res) => {
  try {
    const myEmail = req.body.email
    const myPassword = req.body.password
    if (!validateBody.isValid(myEmail)) {
      return res.status(400).send({ status: false, msg: "Please provide Your email Id" });;
    }
    if (!validateBody.isValid(myPassword)) {
      return res.status(400).send({ status: false, msg: "Please provide Your password" });;
    }
    let user = await userModel.findOne({ email: myEmail, isDeleted: false });
    if (!user) {
      return res.status(400).send({ status: false, message: "Invalid Credentials" })
    }
    const { _id, first_Name, last_Name, email, mobile, password } = user
    const validPassword = await bcrypt.compare(myPassword, password);
    if (!validPassword) {
      return res.status(400).send({ message: "Invalid Password" })
    }
    let payload = { userId: _id, email: email };
    const generatedToken = jwt.sign(payload, "aksr-aman-key", { expiresIn: '10080m' });
    res.header('user-login-key', generatedToken);
    return res.status(200).send({
      status: true,
      message: `${first_Name} ${last_Name} you have logged in Succesfully`,
      data: {
        userId: user._id,
        token: generatedToken,
      }
    });

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getUser = async (req, res) => {
  const userid = req.params.userId;
  let checkId = ObjectId.isValid(userid);
  if (!checkId) {
    return res.status(400).send({ status: false, message: "Please Provide a valid userId in query params" });;
  }
  const details = await userModel.findOne({ _id: userid });
  if (!details) {
    return res.status(400).send({ status: false, msg: "No user is found" });
  }
  return res.status(200).send({ status: true, msg: "successful", details });
}

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId
    let checkId = ObjectId.isValid(userId);
    if (!checkId) {
      return res.status(400).send({ status: false, message: "Please Provide a valid userId in query params" });;
    }
    let userBody = JSON.parse(req.body.data)
    let { first_Name, last_Name, email, mobile, password } = userBody
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }
    let updateProfile = await userModel.findOneAndUpdate({ _id: userId }, { first_Name: first_Name, last_Name: last_Name, email: email, password: password, mobile: mobile }, { new: true })
    return res.status(200).send({ status: true, message: "user profile update successfull", data: updateProfile })
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message })
  }
}

module.exports = { registerUser, userVerifier, userLogin, updateProfile, getUser };