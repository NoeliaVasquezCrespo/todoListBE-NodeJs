const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const taskController = require('../controllers/task.controller');

router.get('/', verifyToken, taskController.index);
router.get('/:id', verifyToken, taskController.show);
router.post('/', verifyToken, taskController.store);
router.put('/:id', verifyToken, taskController.update);
router.delete('/:id', verifyToken, taskController.destroy);

module.exports = router;
