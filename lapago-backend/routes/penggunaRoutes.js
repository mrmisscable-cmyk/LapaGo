const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/penggunaController');

router.post('/register', penggunaController.register);
router.post('/login', penggunaController.login);

module.exports = router;