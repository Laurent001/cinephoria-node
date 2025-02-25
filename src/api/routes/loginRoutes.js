const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

router.post("/", loginController.getLogin);
router.post("/password-reset/request", loginController.sendEmailReset);
router.post(
  "/password-reset",
  loginController.verifyToken,
  loginController.passwordReset
);

module.exports = router;
