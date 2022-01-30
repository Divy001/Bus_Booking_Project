const busModels = require("../models/busModel");

const createBus = async (req, res) => {
    try {
        const buses = req.body;
        let busSaved = await busModels.create(buses);
        res.status(200).send({ message: "Bus Created successfull,", data: busSaved });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

const getBusDetails = async (req, res) => {
    try {
        let myQuery = req.query
        let countBus = await busModels.find(myQuery).count()
        let findBus = await busModels.find(myQuery);
        if (findBus.length > 0) {
            return res.status(200).send({ message: "these buses are available on your request",total_buses: countBus+" bus available for your request", data: findBus });
        } else {
            res.status(404).send({ status: false, message: "Sorry, there is no bus oon this route" });
        }
        return res.status(200).send({ message: "bus details", data: bookingSaved });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

module.exports.createBus = createBus;
module.exports.getBusDetails = getBusDetails;