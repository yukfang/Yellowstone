const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  setTimeout(() => {
    res.end('respond with a resource after 5 seconds');
  }, 5000);
});

router.get('/errors', function(req, res, next) {
  // setTimeout(() => {
  //   res.end('respond with a resource after 5 seconds');
  // }, 5000);
  throw new Error('foo bar');
});
module.exports = router;
