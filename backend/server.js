require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const prisma = require("./src/config/db"); // أضفنا استدعاء بريزما لكي يعمل مسار فحص القاعدة بنجاح

const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

const app = express();
app.set('trust proxy', 1);
app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/db-check", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "Database connected",
      result
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);
    res.status(500).json({
      status: "Database connection failed",
      message: error.message
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Request failed"
  });
});

// Vercel Serverless
module.exports = app;

// Local development
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`API running on port ${port}`); // تصحيح علامات التنصيص إلى Backticks
  });
}
