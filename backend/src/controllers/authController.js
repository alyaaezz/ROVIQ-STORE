const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// تسجيل دخول الأدمن فقط
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
  const admin = await prisma.admin.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }
  const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
  res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
};

exports.me = async (req, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id }, select: { id: true, name: true, email: true } });
  if (!admin) return res.status(404).json({ message: "Admin not found" });
  res.json(admin);
};

exports.updateAdminAccount = async (req, res) => {
  try {
    const { currentPassword, email: newEmail, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const validPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!validPassword) return res.status(401).json({ message: "Current password is incorrect" });

    const data = {};
    if (newEmail) {
      const email = newEmail.toLowerCase().trim();
      const existing = await prisma.admin.findUnique({ where: { email } });
      if (existing && existing.id !== admin.id) {
        return res.status(409).json({ message: "This email is already in use" });
      }
      data.email = email;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({ message: "Enter a new email or password" });
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data,
      select: { id: true, name: true, email: true }
    });

    res.json({ message: "Account updated successfully", admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Could not update admin account" });
  }
};