const router = require("express").Router();
const c = require("../controllers/authController");
const { requireAdmin } = require("../middleware/auth");

// مسارات الأدمن فقط (اللوحة والإدارة)
router.post("/login", c.login);
router.get("/me", requireAdmin, c.me);
router.patch("/admin/account", requireAdmin, c.updateAdminAccount);

module.exports = router;