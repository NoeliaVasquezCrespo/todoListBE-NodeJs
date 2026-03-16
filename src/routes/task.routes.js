const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');

router.get('/', taskController.index);
router.get('/:id', taskController.show);
router.post('/', taskController.store);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.destroy);

module.exports = router;
