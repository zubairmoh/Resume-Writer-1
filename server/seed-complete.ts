import { Pool } from "pg";
import bcrypt from "bcrypt";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/proresumes";

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    console.log("🌱 Starting comprehensive database seed...\n");

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);
    console.log("✓ Password hashed");

    // 1. Create Admin
    const adminResult = await pool.query(`
      INSERT INTO users (id, username, password, email, full_name, role, created_at)
      VALUES (gen_random_uuid(), 'admin', $1, 'admin@proresumes.com', 'System Admin', 'admin', NOW())
      ON CONFLICT (username) DO UPDATE SET password = $1
      RETURNING id, username
    `, [hashedPassword]);
    const adminId = adminResult.rows[0].id;
    console.log(`✓ Admin created: ${adminResult.rows[0].username} (${adminId})`);

    // 2. Create Writers
    const writer1Result = await pool.query(`
      INSERT INTO users (id, username, password, email, full_name, role, created_at)
      VALUES (gen_random_uuid(), 'writer1', $1, 'writer1@proresumes.com', 'Sarah Johnson', 'writer', NOW())
      ON CONFLICT (username) DO UPDATE SET password = $1
      RETURNING id, username
    `, [hashedPassword]);
    const writer1Id = writer1Result.rows[0].id;
    console.log(`✓ Writer created: ${writer1Result.rows[0].username} (${writer1Id})`);

    const writer2Result = await pool.query(`
      INSERT INTO users (id, username, password, email, full_name, role, created_at)
      VALUES (gen_random_uuid(), 'writer2', $1, 'writer2@proresumes.com', 'Michael Chen', 'writer', NOW())
      ON CONFLICT (username) DO UPDATE SET password = $1
      RETURNING id, username
    `, [hashedPassword]);
    console.log(`✓ Writer created: ${writer2Result.rows[0].username}`);

    // 3. Create Clients
    const client1Result = await pool.query(`
      INSERT INTO users (id, username, password, email, full_name, role, created_at)
      VALUES (gen_random_uuid(), 'client1', $1, 'client1@proresumes.com', 'Jane Doe', 'client', NOW())
      ON CONFLICT (username) DO UPDATE SET password = $1
      RETURNING id, username
    `, [hashedPassword]);
    const client1Id = client1Result.rows[0].id;
    console.log(`✓ Client created: ${client1Result.rows[0].username} (${client1Id})`);

    const client2Result = await pool.query(`
      INSERT INTO users (id, username, password, email, full_name, role, created_at)
      VALUES (gen_random_uuid(), 'client2', $1, 'client2@proresumes.com', 'John Smith', 'client', NOW())
      ON CONFLICT (username) DO UPDATE SET password = $1
      RETURNING id, username
    `, [hashedPassword]);
    const client2Id = client2Result.rows[0].id;
    console.log(`✓ Client created: ${client2Result.rows[0].username}`);

    // 4. Create Orders
    const order1Result = await pool.query(`
      INSERT INTO orders (id, client_id, writer_id, package_type, price, status, target_job_url, revisions_remaining, created_at)
      VALUES (gen_random_uuid(), $1, $2, 'Professional', 199, 'in_progress', 'https://linkedin.com/jobs/view/product-manager-123', 3, NOW())
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [client1Id, writer1Id]);
    const order1Id = order1Result.rows[0]?.id;
    if (order1Id) {
      console.log(`✓ Order created for client1 -> writer1 (${order1Id})`);
    }

    const order2Result = await pool.query(`
      INSERT INTO orders (id, client_id, writer_id, package_type, price, status, target_job_url, revisions_remaining, created_at)
      VALUES (gen_random_uuid(), $1, $2, 'Executive', 349, 'pending', 'https://linkedin.com/jobs/view/senior-engineer-456', 999, NOW() - INTERVAL '2 days')
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [client2Id, writer1Id]);
    const order2Id = order2Result.rows[0]?.id;
    if (order2Id) {
      console.log(`✓ Order created for client2 -> writer1`);
    }

    // 5. Create Documents (if order exists)
    if (order1Id) {
      await pool.query(`
        INSERT INTO documents (id, order_id, uploaded_by, file_name, file_url, file_type, file_size, created_at)
        VALUES 
          (gen_random_uuid(), $1, $2, 'current_resume.pdf', 'https://proresumes.s3.amazonaws.com/uploads/current_resume.pdf', 'application/pdf', 245000, NOW()),
          (gen_random_uuid(), $1, $2, 'cover_letter.docx', 'https://proresumes.s3.amazonaws.com/uploads/cover_letter.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 32000, NOW())
        ON CONFLICT DO NOTHING
      `, [order1Id, client1Id]);
      console.log(`✓ Documents created for order1`);
    }

    // 6. Create Messages (if order exists)
    if (order1Id) {
      await pool.query(`
        INSERT INTO messages (id, order_id, sender_id, content, type, created_at)
        VALUES 
          (gen_random_uuid(), $1, $2, 'Hi! I have uploaded my current resume. I am targeting Product Manager roles at tech companies.', 'order_chat', NOW() - INTERVAL '1 hour'),
          (gen_random_uuid(), $1, $3, 'Thanks Jane! I have reviewed your resume. I will start working on the first draft today. Do you have any specific achievements you want me to highlight?', 'order_chat', NOW() - INTERVAL '30 minutes')
        ON CONFLICT DO NOTHING
      `, [order1Id, client1Id, writer1Id]);
      console.log(`✓ Messages created for order1`);
    }

    // 7. Create Leads
    await pool.query(`
      INSERT INTO leads (id, name, email, source, status, created_at)
      VALUES (gen_random_uuid(), 'Website Visitor', 'visitor@anonymous.com', 'Live Chat', 'new', NOW())
      ON CONFLICT DO NOTHING
    `);
    console.log(`✓ Lead created: Website Visitor`);

    // 8. Create Applications (Job Tracker)
    await pool.query(`
      INSERT INTO applications (id, user_id, company, position, status, applied_at, updated_at)
      VALUES 
        (gen_random_uuid(), $1, 'Google', 'Product Manager', 'applied', NOW() - INTERVAL '5 days', NOW()),
        (gen_random_uuid(), $1, 'Meta', 'Senior PM', 'interviewing', NOW() - INTERVAL '3 days', NOW()),
        (gen_random_uuid(), $1, 'Amazon', 'Technical PM', 'applied', NOW() - INTERVAL '1 day', NOW())
      ON CONFLICT DO NOTHING
    `, [client1Id]);
    console.log(`✓ Job applications created for client1`);

    // 9. Create Admin Settings
    await pool.query(`
      INSERT INTO admin_settings (id, stripe_publishable_key, paypal_client_id, business_email, fomo_enabled, chat_widget_enabled, packages, updated_at)
      VALUES (
        gen_random_uuid(), 
        'pk_test_xxxxx', 
        'paypal_client_id_xxxxx',
        'admin@proresumes.com',
        true,
        true,
        '[{"name":"Basic","price":99,"features":["Professional Resume","ATS Optimization","1 Revision"]},{"name":"Professional","price":199,"features":["Professional Resume","Cover Letter","ATS Optimization","LinkedIn Review","3 Revisions"]},{"name":"Executive","price":349,"features":["Executive Resume","Cover Letter","LinkedIn Makeover","ATS Optimization","Unlimited Revisions","Priority Support"]}]'::jsonb,
        NOW()
      )
      ON CONFLICT DO NOTHING
    `);
    console.log(`✓ Admin settings created`);

    console.log("\n✅ Database seeded successfully!\n");
    console.log("Test Credentials:");
    console.log("================");
    console.log("Admin:   admin / password123");
    console.log("Writer:  writer1 / password123");
    console.log("Writer:  writer2 / password123");
    console.log("Client:  client1 / password123 (has order with writer1)");
    console.log("Client:  client2 / password123 (has order with writer1)");
    console.log("");

  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
