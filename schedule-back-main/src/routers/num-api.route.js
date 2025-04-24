const express = require('express');
const router = express.Router();
const numApiController = require('../controllers/num-api.controller');

router.get('/', numApiController.index);
router.get('/buildings', numApiController.getBuildings);
router.post('/rooms', numApiController.getRooms);
router.get('/get-all-rooms', numApiController.getAllRooms);
router.post('/schedules', numApiController.getSchedules);
router.get('/save-all-schedules', numApiController.saveAllSchedulesToDB);
router.post('/get-schedules-filter', numApiController.getAvailableSchedulesByFilters);
// router.get('/get-all-schedules', numApiController.getAllSchedules);
router.post('/schedule-room', numApiController.scheduleRoom);

module.exports = router;
