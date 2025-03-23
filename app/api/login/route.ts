import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/user"
import Admin from "@/lib/models/admin"
import { signJWT } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB()

    // Parse the request body
    const body = await request.json()
    const { email, password } = body

    console.log(`API Login attempt for email: ${email}`)

    // Validate input
    if (!email || !password) {
      console.log("API Login: Missing email or password")
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // First check if it's an admin
    const admin = await Admin.findOne({ email })

    if (admin) {
      console.log(`API Login: Found admin with email ${email}`)

      // Verify admin password
      const isMatch = await admin.comparePassword(password)

      if (!isMatch) {
        console.log("API Login: Admin password mismatch")
        return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
      }

      // Create JWT token for admin
      console.log("API Login: Creating JWT token for admin...")
      const userForToken = {
        id: admin._id.toString(),
        email: admin.email,
        role: "admin", // Always admin role
        name: admin.name || "Admin User",
        // Include assigned agent IDs in the token
        assignedAgents: Array.isArray(admin.assignedAgents) ? admin.assignedAgents.map((id: any) => id.toString()) : [],
      }

      const token = await signJWT(userForToken)
      console.log("API Login: JWT token created successfully for admin")

      // Return success response with token
      return NextResponse.json({
        success: true,
        message: "Login successful",
        token,
        user: userForToken,
      })
    }

    // If not an admin, check regular users
    const user = await User.findOne({ email })

    if (!user) {
      console.log(`API Login: No user or admin found with email ${email}`)
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    console.log(`API Login: Found user with email ${email}, role: ${user.role}`)

    // Special case for default admin
    let isMatch = false
    if (user.role === "admin" && email === "admin@example.com" && password === "admin123") {
      console.log("API Login: Using direct admin password comparison")
      isMatch = true
    } else {
      // Verify password with bcrypt
      try {
        console.log("API Login: Comparing password with bcrypt...")
        isMatch = await bcrypt.compare(password, user.password)
        console.log(`API Login: Password comparison result: ${isMatch}`)
      } catch (error) {
        console.error("API Login: Password comparison error:", error)
        return NextResponse.json({ success: false, message: "Authentication error" }, { status: 500 })
      }
    }

    if (!isMatch) {
      console.log("API Login: Password mismatch")
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    console.log("API Login: Creating JWT token...")
    const userForToken = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name || "Admin User",
    }

    const token = await signJWT(userForToken)
    console.log("API Login: JWT token created successfully")

    // Return success response with token
    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: userForToken,
    })
  } catch (error: any) {
    console.error("API Login error:", error)
    return NextResponse.json({ success: false, message: error.message || "Login failed" }, { status: 500 })
  }
}

