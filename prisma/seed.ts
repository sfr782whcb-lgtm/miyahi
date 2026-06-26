import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

const products = [
  { name: "قارورة 20 لتر", sizeLiters: 20, price: 5 },
  { name: "قارورة 10 لتر", sizeLiters: 10, price: 3 },
];

const users = [
  {
    phone: "0500000001",
    password: "admin123",
    name: "مدير النظام",
    role: "ADMIN" as UserRole,
  },
  {
    phone: "0501111111",
    password: "driver123",
    name: "خالد الزهراني",
    role: "DRIVER" as UserRole,
    driverName: "خالد الزهراني",
    driverStatus: "AVAILABLE" as const,
  },
  {
    phone: "0502222222",
    password: "driver123",
    name: "عمر الشمري",
    role: "DRIVER" as UserRole,
    driverName: "عمر الشمري",
    driverStatus: "BUSY" as const,
  },
  {
    phone: "0503333333",
    password: "customer123",
    name: "أحمد الخالدي",
    role: "CUSTOMER" as UserRole,
    customerPhone: "0501234567",
    address: "شارع الملك فهد",
    area: "حي النزهة",
  },
];

async function main() {
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();

  const createdProducts = await Promise.all(
    products.map((p) => prisma.product.create({ data: p })),
  );

  const product20 = createdProducts.find((p) => p.sizeLiters === 20)!;
  const product10 = createdProducts.find((p) => p.sizeLiters === 10)!;

  const driverByName = new Map<string, string>();

  for (const userData of users) {
    const passwordHash = await hashPassword(userData.password);

    if (userData.role === "ADMIN") {
      await prisma.user.create({
        data: {
          phone: userData.phone,
          passwordHash,
          name: userData.name,
          role: "ADMIN",
        },
      });
      continue;
    }

    if (userData.role === "DRIVER" && userData.driverName) {
      const driver = await prisma.driver.create({
        data: {
          name: userData.driverName,
          status: userData.driverStatus,
        },
      });
      driverByName.set(userData.driverName, driver.id);

      await prisma.user.create({
        data: {
          phone: userData.phone,
          passwordHash,
          name: userData.name,
          role: "DRIVER",
          driver: { connect: { id: driver.id } },
        },
      });
      continue;
    }

    if (userData.role === "CUSTOMER") {
      const customer = await prisma.customer.create({
        data: {
          name: userData.name,
          phone: userData.customerPhone!,
          address: userData.address,
          area: userData.area,
        },
      });

      await prisma.user.create({
        data: {
          phone: userData.phone,
          passwordHash,
          name: userData.name,
          role: "CUSTOMER",
          customer: { connect: { id: customer.id } },
        },
      });
    }
  }

  // Additional drivers without login
  const extraDrivers = [
    { name: "فهد العنزي", status: "AVAILABLE" as const },
    { name: "سامر حسن", status: "OFFLINE" as const },
  ];

  for (const d of extraDrivers) {
    const driver = await prisma.driver.create({ data: d });
    driverByName.set(d.name, driver.id);
  }

  const orders = [
    {
      customerName: "أحمد الخالدي",
      phone: "0501234567",
      address: "شارع الملك فهد",
      area: "حي النزهة",
      bottles: 5,
      product: product20,
      status: "DELIVERED" as const,
      driverName: "خالد الزهراني",
      daysAgo: 0,
    },
    {
      customerName: "سارة المنصور",
      phone: "0509876543",
      address: "طريق الأمير سلطان",
      area: "حي الصفا",
      bottles: 3,
      product: product10,
      status: "OUT_FOR_DELIVERY" as const,
      driverName: "عمر الشمري",
      daysAgo: 0,
    },
    {
      customerName: "محمد العتيبي",
      phone: "0551122334",
      address: "شارع العليا",
      area: "حي الروضة",
      bottles: 8,
      product: product20,
      status: "NEW" as const,
      driverName: null,
      daysAgo: 0,
    },
    {
      customerName: "نورة القحطاني",
      phone: "0544433221",
      address: "شارع التحلية",
      area: "حي الملقا",
      bottles: 6,
      product: product20,
      status: "DELIVERED" as const,
      driverName: "فهد العنزي",
      daysAgo: 3,
    },
  ];

  for (const order of orders) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - order.daysAgo);

    await prisma.order.create({
      data: {
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        area: order.area,
        bottles: order.bottles,
        bottleSize: order.product.sizeLiters,
        productId: order.product.id,
        status: order.status,
        price: order.bottles * order.product.price,
        driverId: order.driverName ? driverByName.get(order.driverName) : undefined,
        createdAt,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
