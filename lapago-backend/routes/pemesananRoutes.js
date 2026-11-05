const express = require('express');
const router = express.Router();
const pemesananController = require('../controllers/pemesananController');

router.post('/', pemesananController.buatPemesanan);
router.get('/:id_booking', pemesananController.getDetailPemesanan);

module.exports = router;