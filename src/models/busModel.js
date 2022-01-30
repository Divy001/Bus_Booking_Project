const mongoose = require("mongoose");
const busSchema = new mongoose.Schema({

    bus_Number: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },

    bus_Type: {
        type: String,
        trim: true,
        required: true,
        enum: ["AC", "Non-AC"]
    },

    from: {
        type: String,
        required: true,
        trim: true,
        enum: ["New Delhi", "Kedarnath", "Kanpur", "Jaipur", "Agra"]
    },

    to: {
        type: String,
        required: true,
        trim: true,
        enum: ["New Delhi", "Kedarnath", "Kanpur", "Jaipur", "Agra"]
    },

    arrival_At: {
        type: String,
        trim: true,
        required: true,
    },

    reach_At: {
        type: String,
        trim: true,
        required: true,
    },
    
    journey_Time: {
        type: String,
        trim: true,
        required: true,
    },

    distance: {
        type: String,
        required: true
    },

    fare: {
        type: Number,
        required: true
    },

    seats: {
        type: Number,
        default: 50
    },
    
    isDeleted: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

module.exports = mongoose.model("myBuses", busSchema);