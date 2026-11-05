const express = require('express');
const router = express.Router();
const lapanganController = require('../controllers/lapanganController');

router.get('/', lapanganController.getSemuaLapangan);
router.post('/', lapanganController.tambahLapangan);

module.exports = router;