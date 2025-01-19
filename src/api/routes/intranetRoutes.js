const express = require("express");
const router = express.Router();
const intranetController = require("../controllers/intranetController");

router.get("/", intranetController.getIntranet);

module.exports = router;
