const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const categoryController = require('../controllers/category.controller.js');

router.get('/', verifyToken, categoryController.index);
router.get('/:id', verifyToken, categoryController.show);
router.post('/', verifyToken, categoryController.store);
router.put('/:id', verifyToken, categoryController.update);
router.delete('/:id', verifyToken, categoryController.destroy);

module.exports = router;
