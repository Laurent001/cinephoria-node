const express = require("express");
const router = express.Router();
const helloController = require("../controllers/helloController");

router.get("/", helloController.getHello);

module.exports = router;
