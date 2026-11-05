const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');

router.get('/', jadwalController.getJadwalByLapangan);
router.post('/', jadwalController.tambahJadwal);

module.exports = router;