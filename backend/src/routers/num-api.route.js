const express = require('express');
const router = express.Router();
const numApiController = require('../controllers/num-api.controller');

router.get('/', numApiController.index);
router.get('/buildings', numApiController.getBuildings);
router.post('/rooms', numApiController.getRooms);
router.get('/get-all-rooms', numApiController.getAllRooms);
router.post('/schedules', numApiController.getSchedules);
router.get('/get-available-schedules', numApiController.getAvailableSchedules);


module.exports = router;
