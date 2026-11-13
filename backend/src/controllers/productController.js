const prisma = require("../config/db");
const slugify = require("../utils/slug");

exports.list = async (req, res) => {
  const { category, search } = req.query;
  const products = await prisma.product.findMany({
    where: { active: true, ...(category ? { category } : {}), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) },
    orderBy: { createdAt: "desc" }
  });
  res.json(products);
};
exports.adminList = async (req, res) => res.json(await prisma.product.findMany({ orderBy: { createdAt: "desc" } }));
exports.create = async (req, res) => {
  const { name, description = "", category = "Hoodies", price, salePrice, images = [], colors = [], sizes = [], stock = 0, active = true } = req.body;
  if (!name || !Number.isInteger(Number(price)) || Number(price) < 0) return res.status(400).json({ message: "Valid name and price are required" });
  const product = await prisma.product.create({ data: {
    name, slug: slugify(name), description, category, price: Number(price),
    salePrice: salePrice === "" || salePrice == null ? null : Number(salePrice),
    images: Array.isArray(images) ? images : [], colors: Array.isArray(colors) ? colors : [],
    sizes: Array.isArray(sizes) ? sizes : [], stock: Math.max(0, Number(stock) || 0), active: Boolean(active)
  }});
  res.status(201).json(product);
};
exports.update = async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };
  ["price", "salePrice", "stock"].forEach(k => { if (data[k] !== undefined) data[k] = data[k] === "" && k === "salePrice" ? null : Number(data[k]); });
  ["images", "colors", "sizes"].forEach(k => { if (data[k] !== undefined && !Array.isArray(data[k])) data[k] = []; });
  delete data.id; delete data.slug; delete data.createdAt; delete data.updatedAt; delete data.orderItems;
  try { res.json(await prisma.product.update({ where: { id }, data })); }
  catch { res.status(404).json({ message: "Product not found" }); }
};
exports.remove = async (req, res) => {
  try { await prisma.product.update({ where: { id: req.params.id }, data: { active: false } }); res.json({ message: "Product hidden from store" }); }
  catch { res.status(404).json({ message: "Product not found" }); }
};
