const router = require("express").Router();
const c = require("../controllers/productController");
const { requireAdmin } = require("../middleware/auth");
router.get("/", c.list);
router.get("/admin/all", requireAdmin, c.adminList);
router.post("/", requireAdmin, c.create);
router.put("/:id", requireAdmin, c.update);
router.delete("/:id", requireAdmin, c.remove);
module.exports = router;
