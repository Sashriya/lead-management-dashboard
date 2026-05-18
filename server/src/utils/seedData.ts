import dotenv from "dotenv";
import User from "../models/User";
import Lead from "../models/Lead";
import connectDB from "../config/database";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log("🗑️  Cleared existing data");

    const admin = await User.create({
      name: "Admin User",
      email: process.env.ADMIN_EMAIL || "admin@smartleads.com",
      password: process.env.ADMIN_PASSWORD || "Admin123!",
      role: "admin",
    });
    console.log("✅ Admin user created:", admin.email);

    const salesUser1 = await User.create({
      name: "Sales User 1",
      email: "sales1@smartleads.com",
      password: "Sales123!",
      role: "sales",
    });
    console.log("✅ Sales user 1 created:", salesUser1.email);

    const salesUser2 = await User.create({
      name: "Sales User 2",
      email: "sales2@smartleads.com",
      password: "Sales123!",
      role: "sales",
    });
    console.log("✅ Sales user 2 created:", salesUser2.email);

    // FIX: seed data now uses lowercase status/source to match the corrected schema
    const sampleLeads = [
      {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        status: "new",
        source: "website",
        notes: "Interested in product demo",
        assignedTo: admin._id,
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1987654321",
        status: "contacted",
        source: "instagram",
        notes: "Following up next week",
        assignedTo: salesUser1._id,
      },
      {
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        phone: "+1122334455",
        status: "qualified",
        source: "referral",
        notes: "Ready for sales call",
        assignedTo: admin._id,
      },
      {
        name: "Alice Brown",
        email: "alice.brown@example.com",
        phone: "+15556667777",
        status: "new",
        source: "linkedin",
        notes: "Requested more information",
        assignedTo: salesUser1._id,
      },
      {
        name: "Charlie Wilson",
        email: "charlie.wilson@example.com",
        phone: "+19998887777",
        status: "contacted",
        source: "website",
        notes: "Sent pricing information",
        assignedTo: salesUser2._id,
      },
      {
        name: "Diana Prince",
        email: "diana.prince@example.com",
        phone: "+14443332222",
        status: "qualified",
        source: "instagram",
        notes: "High potential customer",
        assignedTo: salesUser2._id,
      },
    ];

    await Lead.create(sampleLeads);
    console.log(`✅ Created ${sampleLeads.length} sample leads`);

    console.log("\n📋 ========== LOGIN CREDENTIALS ==========");
    console.log(`👑 Admin:   ${admin.email} / Admin123!  (sees ALL leads)`);
    console.log(`👤 Sales 1: ${salesUser1.email} / Sales123!`);
    console.log(`👤 Sales 2: ${salesUser2.email} / Sales123!`);
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
