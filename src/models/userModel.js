const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        enum: ["Mr", "Mrs", "Miss", "Other"],
    },

    first_Name: {
        type: String,
        required: true,
        trim: true,
    },

    last_Name: {
        type: String,
        trim: true,
    },

    mobile: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
        trim: true,
    },

    balance: {
        type: Number,
        default: 100
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    expireTime: {
        type: Date,
        expires: '1m',
        default: Date.now()
    },

    isDeleted: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);
module.exports = mongoose.model("Registered User", userSchema);