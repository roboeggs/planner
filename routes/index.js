var express = require('express');
const { body, validationResult } = require("express-validator");
const encoded = require('./encodedData');
const helpers = require('./helpers');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // for (const task of encoded["subtasks"]) {
  //   console.log(task);
  // }
  res.render('index', { title: 'Express', data: encoded, getColorByComplexity: helpers.getColorByComplexity });
});

module.exports = router;
