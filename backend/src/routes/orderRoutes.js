const router = require("express").Router();
const c = require("../controllers/orderController");
const { requireAdmin } = require("../middleware/auth");
router.post("/", c.create);
router.get("/", requireAdmin, c.adminList);
router.get("/dashboard", requireAdmin, c.dashboard);
router.patch("/:id/status", requireAdmin, c.updateStatus);
router.patch("/:id/payment", requireAdmin, c.updatePayment);
module.exports = router;
