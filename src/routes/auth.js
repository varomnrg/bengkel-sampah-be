const router = require("express").Router();
const authControllers = require("../controllers/auth");

router.post("/register", authControllers.register);
router.post("/login", authControllers.login);
router.post("/refreshtoken", authControllers.refreshToken);

module.exports = router;
