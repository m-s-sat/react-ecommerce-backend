const express = require('express');
const { fetchCategories } = require('../controller/Category');
const router = express.Router();

router.get('/',fetchCategories);

exports.router = router;