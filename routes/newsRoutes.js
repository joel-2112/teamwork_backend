const express = require('express');
const router = express.Router();
const NewsController = require('../controllers/newsController');
//the news routes
router.post('/', NewsController.createNews);
router.get('/', NewsController.getAllNews);
router.get('/:id', NewsController.getNewsById);
router.put('/:id', NewsController.updateNews);
router.delete('/:id', NewsController.deleteNews);

module.exports = router;