const express = require('express');
const router = new express.Router();

router.use("/", (req, res) => {
  res.send({ msg: "Hello from dummy!" });
});

module.exports = router;
