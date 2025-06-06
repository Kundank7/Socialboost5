"use server"

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export async function seedDatabase() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    // Check if tables exist
    const tablesExist = await checkTablesExist(sql)
    if (!tablesExist) {
      return { success: false, error: "Database tables don't exist. Please initialize the database first." }
    }

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10)
    await sql`
      INSERT INTO admins (username, password_hash)
      VALUES ('admin', ${adminPassword})
      ON CONFLICT (username) DO UPDATE
      SET password_hash = ${adminPassword}
    `
    console.log("Seeded admin user")

    // Create default settings
    const settings = [
      { key: "site_name", value: "SocialBoost" },
      { key: "site_description", value: "Boost your social media presence" },
      { key: "contact_email", value: "contact@socialboost.com" },
      { key: "contact_phone", value: "+1 (555) 123-4567" },
      { key: "usd_to_inr_rate", value: "83.5" },
    ]

    for (const setting of settings) {
      await sql`
        INSERT INTO settings (key, value)
        VALUES (${setting.key}, ${setting.value})
        ON CONFLICT (key) DO UPDATE
        SET value = ${setting.value}
      `
    }
    console.log("Seeded settings")

    // Create sample services
    const services = [
      { platform: "instagram", name: "Followers", price: 1.5 },
      { platform: "instagram", name: "Likes", price: 0.8 },
      { platform: "instagram", name: "Views", price: 0.5 },
      { platform: "facebook", name: "Page Likes", price: 2.0 },
      { platform: "facebook", name: "Followers", price: 1.8 },
      { platform: "facebook", name: "Post Reach", price: 1.2 },
      { platform: "youtube", name: "Subscribers", price: 3.0 },
      { platform: "youtube", name: "Views", price: 1.0 },
      { platform: "youtube", name: "Likes", price: 0.7 },
      { platform: "telegram", name: "Channel Members", price: 2.5 },
      { platform: "telegram", name: "Post Views", price: 0.9 },
      { platform: "telegram", name: "Reactions", price: 0.6 },
    ]

    for (const service of services) {
      await sql`
        INSERT INTO services (platform, name, price)
        VALUES (${service.platform}, ${service.name}, ${service.price})
        ON CONFLICT (platform, name) DO UPDATE
        SET price = ${service.price}, active = true
      `
    }
    console.log("Seeded services")

    return { success: true, message: "Database seeded successfully" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to seed database",
    }
  }
}

// Helper function to check if tables exist
async function checkTablesExist(sql: any) {
  try {
    // Check if users table exists as a proxy for all tables
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      )
    `
    return result[0].exists
  } catch (error) {
    console.error("Error checking if tables exist:", error)
    return false
  }
}
