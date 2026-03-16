const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const tagController = require('../controllers/tag.controller.js');

router.get('/', verifyToken, tagController.index);
router.get('/:id', verifyToken, tagController.show);
router.post('/', verifyToken, tagController.store);
router.put('/:id', verifyToken, tagController.update);
router.delete('/:id', verifyToken, tagController.destroy);

module.exports = router;
