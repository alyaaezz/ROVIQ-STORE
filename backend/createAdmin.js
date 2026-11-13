const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

async function main() {
  const email = "admin@roviq.com";
  const password = "adminpassword123";
  
  // تشفير كلمة المرور بالأمان المطلوب
  const passwordHash = await bcrypt.hash(password, 10);

  // إنشاء أو تحديث حساب الأدمن في قاعدة البيانات
  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      name: "Super Admin",
      email: email,
      passwordHash: passwordHash,
    },
  });

  console.log("✅ Admin created successfully!");
  console.log("📧 Email:", admin.email);
  console.log("🔑 Password:", password);
}

main()
  .catch((e) => {
    console.error("❌ Error creating admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });