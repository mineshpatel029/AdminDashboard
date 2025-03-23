import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/user"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB()

    // Parse the request body
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 409 })
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create the admin user
    const newAdmin = await User.create({
      email,
      password: hashedPassword,
      role: "admin",
      name: name || "Admin User",
    })

    // Return success response with user data (excluding password)
    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: newAdmin._id.toString(),
        email: newAdmin.email,
        role: newAdmin.role,
        name: newAdmin.name,
      },
    })
  } catch (error: any) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create admin user" },
      { status: 500 },
    )
  }
}

