const bookingModel = require("../models/bookingModel");
const bookingModels = require("../models/bookingModel");
const busModel = require('../models/busModel');
const userModel = require("../models/userModel");

//-------------------------------For the creation of Booking-------------------------------//
const doBooking = async (req, res) => {
    try {
        const booking = req.body;
        const { journey_Date, from, to, bus_Number, passenger_details, mobile, address, paymentBy } = booking;
        const busDetails = await busModel.findOne({ bus_Number: bus_Number }).select({ _id: 0, bus_Number: 1, bus_Type: 1, arrival_At: 1, reach_At: 1, journey_Time: 1, distance: 1 })
        const checkBus = await busModel.findOne({ bus_Number: bus_Number })
        if (!checkBus) {
            return res.status(400).send({ message: "Sorry there no bus exist with this bus_Number" })
        }
        const busFind = await busModel.findOne({ to: to, from: from, bus_Number: bus_Number })
        if (!busFind) {
            return res.status(400).send({ message: "Currently No bus running on this route" })
        }
        const { _id, fare, seats } = busFind
        const bus_Details = busDetails
        const objectLength = passenger_details.length
        const total_Fare = fare * objectLength
        let total_Passengers = objectLength
        if (objectLength > seats) {
            return res.status(400).send({ msg: "We are very sorry to say that currently seats are not available" });;
        }
        if (!(paymentBy == "Wallet")) {
            return res.status(400).send({ message: "Other Payment Methods are not available at that time, Please PopUp your Wallet to Proceed this Booking" })
        }
        const userId = req.userId;
        const checkBalance = await userModel.findOne({ _id: userId })
        const myBalance = checkBalance.balance
        let booked_At = Date();
        if (myBalance < total_Fare) {
            return res.status(400).send({ msg: "Your Wallet Balance is Insufficient for this Booking Please recharge your Wallet to complete this booking" });;
        }
        let PNR_Number = Date.now();
        const bookSeats = { userId, PNR_Number, journey_Date, from, to, bus_Details, passenger_details, total_Passengers, mobile, address, paymentBy, total_Fare, booked_At }
        if (bookSeats) {
            let billing = await userModel.findByIdAndUpdate({ _id: userId }, { balance: myBalance - total_Fare })
            if (billing) {
                const bookingSaved = await bookingModels.create(bookSeats)
                if (bookingSaved) {
                    await busModel.findOneAndUpdate({ _id: _id }, { seats: seats - objectLength })
                    res.status(200).send({ message: "Booking successfull, Happy Journey", Booking_Details: bookingSaved });
                } else { await userModel.findByIdAndUpdate({ _id: userId }, { balance: myBalance + total_Fare }) }
            } else { res.status(400).send({ message: "there is some error occurred while billing" }) }
        } else { res.status(400).send({ message: "there is some error occurred while fetching the booking details" }) }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

//------------------------------For the cancellation of Booking-------------------------------//

const cancelBooking = async (req, res) => {
    try {
        let pnr = req.body.PNR_Number
        if (!pnr) {
            return res.status(400).send({ message: "Please provide PNR_Number to cancel your booking" })
        }
        let checkCancellation = await bookingModel.findOne({ PNR_Number: pnr })
        if (!checkCancellation) {
            return res.status(400).send({ message: "This booking id does not exist" })
        }
        let busNum = checkCancellation.bus_Details.bus_Number
        let totalPass = checkCancellation.total_Passengers
        let cancelSeat = await busModel.findOne({ bus_Number: busNum })
        let remainings = cancelSeat.seats
        let { isCancelled } = checkCancellation
        if (isCancelled == true) {
            return res.status(400).send({ msg: "Your booking has already been cancelled" });;
        }
        let cancellation = await bookingModel.findOneAndUpdate({ PNR_Number: pnr }, { isCancelled: true })
        if (cancellation) {
            let { userId, total_Fare } = cancellation;
            let cancellationCharge = total_Fare / 10
            let refundUser = await userModel.findOne({ _id: userId })
            let { balance } = refundUser
            let refund = await userModel.findOneAndUpdate({ _id: userId }, { balance: balance + total_Fare - cancellationCharge })
            if (refund) {
                let seatBack = await busModel.findOneAndUpdate({ bus_Number: busNum }, { seats: remainings + totalPass })
                if (seatBack) {
                   return res.status(200).send({ message: "Your booking has been cancelled successfully", cancellationCharge: cancellationCharge, refund: total_Fare - cancellationCharge })
                }
            }
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const cancelSelective = async (req, res) => {
    try {
        let pnr = req.body.PNR_Number
        let passenger = req.body.passengerId
        if (!pnr) {
            return res.status(400).send({ message: "Please provide PNR_Number to cancel your booking" })
        }
        if (passenger.length < 1) {
            return res.status(400).send({ message: "Please provide passengerId to cancel your booking" })
        }
        let checkCancellation = await bookingModel.findOne({ PNR_Number: pnr })
        if (!checkCancellation) {
            return res.status(400).send({ message: "This booking id does not exist" })
        }
        if (passenger.length == checkCancellation.passenger_details.length) {
            return res.status(400).send({ message: "Kindly use full cancellation if you want cancel all seats" })
        }
        let count = 0
        for (let i = 0; i < passenger.length; i++) {
            for (let j = 0; j < checkCancellation.passenger_details.length; j++) {
                if (passenger[i] == checkCancellation.passenger_details[j]._id) {
                    count += 1
                    checkCancellation.passenger_details.splice(j, 1)
                    checkCancellation.total_Passengers -= 1
                }
            }
        }
        let busNum = checkCancellation.bus_Details.bus_Number
        let cancelSeat = await busModel.findOne({ bus_Number: busNum })
        let cancelFee = (count * cancelSeat.fare) / 10
        let finalRefund = (count * cancelSeat.fare) - cancelFee
        checkCancellation.total_Fare = checkCancellation.total_Fare - finalRefund
        checkCancellation.save()
        let remainings = cancelSeat.seats
        let cancellation = await bookingModel.findOne({ PNR_Number: pnr })
        let { userId } = cancellation;
        let refundUser = await userModel.findOne({ _id: userId })
        let { balance } = refundUser
        let refund = await userModel.findOneAndUpdate({ _id: userId }, { balance: balance + finalRefund })
        if (refund) {
            let seatBack = await busModel.findOneAndUpdate({ bus_Number: busNum }, { seats: remainings + count })
            if (seatBack) {
               return res.send({ message: "Your selected booking has been cancelled successfully", cancellationCharge: cancelFee, refund: finalRefund })
            }
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { doBooking, cancelBooking, cancelSelective };