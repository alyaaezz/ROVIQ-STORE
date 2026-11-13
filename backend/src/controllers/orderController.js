const prisma = require("../config/db");
const { z } = require("zod");

const orderSchema = z.object({
  customerName: z.string().min(2).max(100),
  phone: z.string().min(8).max(25),
  address: z.string().min(5).max(300),
  city: z.string().min(2).max(80),
  notes: z.string().max(500).optional().default(""),
  paymentMethod: z.enum(["COD", "VODAFONE_CASH", "INSTAPAY"]),
  paymentReference: z.string().max(100).optional().default(""),
  items: z.array(z.object({ productId: z.string(), size: z.string(), color: z.string(), quantity: z.number().int().min(1).max(20) })).min(1)
});

exports.create = async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please check the order details", errors: parsed.error.flatten() });
  const input = parsed.data;
  try {
    const order = await prisma.$transaction(async tx => {
      const ids = [...new Set(input.items.map(i => i.productId))];
      const products = await tx.product.findMany({ where: { id: { in: ids }, active: true } });
      const map = new Map(products.map(p => [p.id, p]));
      let subtotal = 0;
      const rows = input.items.map(item => {
        const p = map.get(item.productId);
        if (!p) throw new Error("A selected product is unavailable");
        if (!p.sizes.includes(item.size) || !p.colors.includes(item.color)) throw new Error(`${p.name}: selected size or color is unavailable`);
        if (p.stock < item.quantity) throw new Error(`${p.name}: insufficient stock`);
        const unitPrice = p.salePrice ?? p.price;
        subtotal += unitPrice * item.quantity;
        return { productId: p.id, name: p.name, image: p.images[0] || null, size: item.size, color: item.color, quantity: item.quantity, unitPrice };
      });
      for (const item of input.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      const shipping = 0; // Configure the store's delivery fee here.
      const orderNumber = `HD-${Date.now().toString().slice(-8)}`;
      return tx.order.create({ data: {
        orderNumber, customerName: input.customerName, phone: input.phone, address: input.address, city: input.city,
        notes: input.notes, subtotal, shipping, total: subtotal + shipping, paymentMethod: input.paymentMethod,
        paymentReference: input.paymentReference, paymentStatus: input.paymentMethod === "COD" ? "UNPAID" : "PROOF_UPLOADED",
        items: { create: rows }
      }, include: { items: true }});
    });
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (e) { res.status(400).json({ message: e.message || "Could not create order" }); }
};

exports.adminList = async (req, res) => {
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  res.json(orders);
};
exports.updateStatus = async (req, res) => {
  const allowed = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status" });
  try { 
    res.json(await prisma.order.update({ where: { id: req.params.id }, data: { status: req.body.status } })); 
  } catch { 
    res.status(404).json({ message: "Order not found" }); 
  }
};
exports.updatePayment = async (req, res) => {
  const allowed = ["UNPAID", "PROOF_UPLOADED", "VERIFIED", "REJECTED"];
  if (!allowed.includes(req.body.paymentStatus)) return res.status(400).json({ message: "Invalid payment status" });
  try { res.json(await prisma.order.update({ where: { id: req.params.id }, data: { paymentStatus: req.body.paymentStatus } })); }
  catch { res.status(404).json({ message: "Order not found" }); }
};
exports.dashboard = async (req, res) => {
  try {
    const productsCount = await prisma.product.count({ where: { active: true } });
    const ordersCount = await prisma.order.count();
    
    // حساب مجموع الأرباح للطلبات المؤكدة (CONFIRMED) أو غير الملغاة
    const confirmedOrders = await prisma.order.findMany({
      where: { 
        status: "CONFIRMED" 
      },
      select: { total: true }
    });
    
    const totalSales = confirmedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    const recentOrders = await prisma.order.findMany({ 
      take: 6, 
      orderBy: { createdAt: "desc" }, 
      include: { items: true } 
    });

    res.json({ 
      products: productsCount, 
      orders: ordersCount, 
      totalSales: totalSales, // إرسال الإجمالي الصحيح
      verifiedRevenue: totalSales, // للتوافق مع أي واجهة أخرى
      recentOrders 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};