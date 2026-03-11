const express = require('express');
const router = express.Router();

const tagController = require('../controllers/tag.controller.js');

router.get('/', tagController.index);
router.get('/:id', tagController.show);
router.post('/', tagController.store);
router.put('/:id', tagController.update);
router.delete('/:id', tagController.destroy);

module.exports = router;
