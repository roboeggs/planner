var express = require('express');
const { body, validationResult } = require("express-validator");
const encoded = require('./encodedData');
const helpers = require('./helpers');

var router = express.Router();

const refactoringJSON = (data) => {
  let json_data = JSON.parse(data);
  for (const task of json_data.subtasks) {
    task.start_date = new Date(task.start_date).getUTCDate();
    task.due_date = new Date(task.due_date).getUTCDate();
    console.log(task.start_date);
  }
  return json_data;
}



/* GET home page. */
router.get('/', function(req, res, next) {
  // for (const task of encoded["subtasks"]) {
  //   console.log(task);
  // }
  res.render('index', { title: 'Express', data: refactoringJSON(encoded), getColorByComplexity: helpers.getColorByComplexity });
});

module.exports = router;