const express = require('express');
const tagController = require('../controllers/tagController');
const auth = require('../middleware/auth');  // 若需登入才可新增 tag，可加 auth

const router = express.Router();

router.get('/', tagController.getAllTags);
router.post('/', auth, tagController.createTag); // 可考慮不加 auth

module.exports = router;
