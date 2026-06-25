'use strict';
const express = require('express');
const router = express.Router();
const { getAll, print } = require('../controllers/invoiceController');
const authenticate = require('../middlewares/authenticate');

router.get('/', authenticate, getAll);
router.get('/:id/print', authenticate, print);

module.exports = router;
