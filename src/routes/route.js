const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const busController = require('../controllers/busController')
const bookingController = require('../controllers/bookingController')
const appMiddleware = require('../middleWares/middelware')
const validation = require("../validation/validation")

router.post('/registerUser', validation.checkUser, userController.registerUser)
router.get("/yourverification", userController.userVerifier)
router.post('/userLogin', userController.userLogin)
router.get("/getUser/:userId", appMiddleware.checkLogin, userController.getUser)
router.put("/userUpdate/:userId", appMiddleware.checkLogin, validation.checkUserupdate, userController.updateProfile)

router.post('/createBus', busController.createBus)
router.get('/getBusDetails', busController.getBusDetails)

router.post('/userBooking', appMiddleware.checkLogin, bookingController.doBooking)
router.post('/cancelBooking', appMiddleware.checkLogin, bookingController.cancelBooking)
router.post('/cancelSelective', appMiddleware.checkLogin, bookingController.cancelSelective)

module.exports = router;