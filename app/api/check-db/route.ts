import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    // Check if users table exists as a proxy for all tables
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      )
    `

    return NextResponse.json({ initialized: result[0].exists })
  } catch (error) {
    console.error("Error checking database status:", error)
    return NextResponse.json({ initialized: false, error: "Failed to check database status" })
  }
}
