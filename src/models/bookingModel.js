const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const bookingSchema = new mongoose.Schema({

    userId: {
        type: ObjectId,
        required: true
    },

    PNR_Number: {
        type: Number,
        required: true,
        unique: true
    },

    journey_Date: {
        type: String,
        required: true,
        trim: true,
    },

    from: {
        type: String,
        required: true,
        trim: true,
        enum: ["New Delhi", "Kedarnath", "Kanpur", "Jaipur", "Agra"],
    },

    to: {
        type: String,
        required: true,
        trim: true,
        enum: ["New Delhi", "Kedarnath", "Kanpur", "Jaipur", "Agra"],
    },

    bus_Details: {
        type: JSON,
        required: true,
    },

    passenger_details: [{
        passenger: {
            title: {
                type: String,
                required: true,
                trim: true,
                enum: ["Mr", "Mrs", "Miss"],
            },
            full_name: {
                type: String,
                required: true,
                trim: true
            },
            age: {
                type: Number,
                required: true,
                trim: true
            },
        },
    }],

    total_Passengers: Number,

    mobile: {
        type: String,
        trim: true,
        required: true
    },

    address: {
        type: String,
        trim: true,
        required: true
    },

    paymentBy: {
        type: String,
        required: true,
        trim: true,
    },

    total_Fare: {
        type: Number,
        required: true,
        trim: true,
    },

    booked_At: String,

    isCancelled: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

module.exports = mongoose.model("Bus Booking", bookingSchema);