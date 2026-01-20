import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("=== SEEDING DATABASE ===");
  console.log("Generating bcrypt hash for 'password123'...");

  const hashedPassword = await bcrypt.hash("password123", 10);
  console.log("Generated hash:", hashedPassword);
  console.log("Hash starts with $2:", hashedPassword.startsWith("$2"));
  console.log("Hash length:", hashedPassword.length);

  // 1. Create Admin
  let admin = await storage.getUserByUsername("admin");
  if (admin) {
    await storage.updateUser(admin.id, { password: hashedPassword });
    console.log("Admin password updated: admin / password123");
  } else {
    admin = await storage.createUser({
      username: "admin",
      password: hashedPassword,
      email: "admin@proresumes.com",
      fullName: "System Admin",
      role: "admin",
    });
    console.log("Admin created: admin / password123");
  }

  // 2. Create Writer
  let writer = await storage.getUserByUsername("writer1");
  if (writer) {
    await storage.updateUser(writer.id, { password: hashedPassword });
    console.log("Writer password updated: writer1 / password123");
  } else {
    writer = await storage.createUser({
      username: "writer1",
      password: hashedPassword,
      email: "writer1@proresumes.com",
      fullName: "John Writer",
      role: "writer",
    });
    console.log("Writer created: writer1 / password123");
  }
  const writerId = writer.id;

  // 3. Create Client
  let client = await storage.getUserByUsername("client1");
  if (client) {
    await storage.updateUser(client.id, { password: hashedPassword });
    console.log("Client password updated: client1 / password123");
  } else {
    client = await storage.createUser({
      username: "client1",
      password: hashedPassword,
      email: "client1@proresumes.com",
      fullName: "Jane Client",
      role: "client",
    });
    console.log("Client created: client1 / password123");
  }
  const clientId = client.id;

  // 4. Create an Order for the client
  if (clientId && writerId) {
    const orders = await storage.getOrdersByClient(clientId);
    if (orders.length === 0) {
      const order = await storage.createOrder({
        clientId,
        writerId,
        packageType: "Professional",
        status: "In Progress",
        price: 199,
        targetJobUrl: "https://www.linkedin.com/jobs/view/123456",
        revisionsRemaining: 3,
      });
      console.log("Test order created for client1");

      // Add a test application
      await storage.createApplication({
        userId: clientId,
        company: "Tech Corp",
        position: "Senior Engineer",
        status: "applied",
        notes: "Applied via company website",
      });
      console.log("Test application created for client1");
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
