import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Admin
  const admin = await storage.getUserByUsername("admin");
  if (!admin) {
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
      email: "admin@proresumes.com",
      fullName: "System Admin",
      role: "admin",
    });
    console.log("Admin created: admin / password123");
  }

  // 2. Create Writer
  const writer = await storage.getUserByUsername("writer1");
  let writerId = writer?.id;
  if (!writer) {
    const newWriter = await storage.createUser({
      username: "writer1",
      password: hashedPassword,
      email: "writer1@proresumes.com",
      fullName: "John Writer",
      role: "writer",
    });
    writerId = newWriter.id;
    console.log("Writer created: writer1 / password123");
  }

  // 3. Create Client
  const client = await storage.getUserByUsername("client1");
  let clientId = client?.id;
  if (!client) {
    const newClient = await storage.createUser({
      username: "client1",
      password: hashedPassword,
      email: "client1@proresumes.com",
      fullName: "Jane Client",
      role: "client",
    });
    clientId = newClient.id;
    console.log("Client created: client1 / password123");
  }

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
