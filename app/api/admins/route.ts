import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Admin from "@/lib/models/admin"
import User from "@/lib/models/user"

// Create a new admin
export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB()

    // Parse the request body
    const body = await request.json()
    const { email, password, name, assignedAgentIds = [] } = body

    console.log(`API: Creating new admin with email: ${email}`)

    // Validate input
    if (!email || !password) {
      console.log("API: Missing email or password")
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email })
    if (existingAdmin) {
      console.log(`API: Admin with email ${email} already exists`)
      return NextResponse.json({ success: false, message: "Admin with this email already exists" }, { status: 409 })
    }

    // Validate that all assigned agent IDs exist
    if (assignedAgentIds.length > 0) {
      const agentCount = await User.countDocuments({
        _id: { $in: assignedAgentIds },
        role: "agent",
      })

      if (agentCount !== assignedAgentIds.length) {
        return NextResponse.json(
          { success: false, message: "One or more assigned agent IDs are invalid" },
          { status: 400 },
        )
      }
    }

    // Create the admin
    const admin = await Admin.create({
      email,
      password, // Will be hashed by the pre-save hook
      name: name || "Admin User",
      assignedAgents: assignedAgentIds || [],
    })

    console.log(`API: Admin created successfully with email: ${email}`)

    // Return success response with admin data (excluding password)
    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        assignedAgents: Array.isArray(admin.assignedAgents) ? admin.assignedAgents.map((id) => id.toString()) : [],
      },
    })
  } catch (error: any) {
    console.error("API: Error creating admin:", error)
    return NextResponse.json({ success: false, message: error.message || "Failed to create admin" }, { status: 500 })
  }
}

// Get all admins (for testing purposes)
export async function GET() {
  try {
    await connectDB()

    const admins = await Admin.find().select("-password").populate("assignedAgents", "name email")

    return NextResponse.json({
      success: true,
      admins: admins.map((admin) => ({
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        assignedAgents: Array.isArray(admin.assignedAgents)
          ? admin.assignedAgents.map((agent: any) => ({
              id: agent._id ? agent._id.toString() : "",
              name: agent.name || "",
              email: agent.email || "",
            }))
          : [],
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch admins" }, { status: 500 })
  }
}

