"use server"

import mongoose from "mongoose"
import connectDB from "../db"
import User from "../models/user"
import { signJWT, setAuthCookie, removeAuthCookie } from "../auth"
import bcrypt from "bcryptjs"

export async function login(formData: FormData) {
  try {
    console.log("Starting login process...")

    // Connect to MongoDB
    console.log("Connecting to MongoDB...")
    await connectDB()
    console.log("MongoDB connection successful")

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log(`Login attempt for email: ${email}`)

    if (!email || !password) {
      console.log("Missing email or password")
      return { success: false, message: "Email and password are required" }
    }

    // First check if it's an admin from the Admin collection
    const Admin = mongoose.models.Admin
    if (Admin) {
      const admin = await Admin.findOne({ email })

      if (admin) {
        console.log(`Found admin with email ${email} in Admin collection`)

        // Verify admin password
        const isMatch = await admin.comparePassword(password)

        if (!isMatch) {
          console.log("Admin password mismatch")
          return { success: false, message: "Invalid credentials" }
        }

        // Create JWT token for admin
        console.log("Creating JWT token for admin...")
        const userForToken = {
          id: admin._id.toString(),
          email: admin.email,
          role: "admin", // Always admin role
          name: admin.name || "Admin User",
        }

        const token = await signJWT(userForToken)
        console.log("JWT token created for admin")

        console.log("Setting auth cookie...")
        await setAuthCookie(token)
        console.log("Auth cookie set")

        console.log("Admin login successful")
        return {
          success: true,
          user: userForToken,
        }
      }
    }

    // Check if we need to create the default admin user
    console.log("Checking for default admin user...")
    const adminCount = await User.countDocuments({ role: "admin" })
    console.log(`Found ${adminCount} admin users in User collection`)

    if (adminCount === 0) {
      // Create the admin user if it doesn't exist
      console.log("Creating default admin user...")
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      await User.create({
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        name: "Admin User",
      })

      console.log("Default admin user created during login attempt")
    }

    // If not an admin in Admin collection, check regular users
    console.log("Finding user by email in User collection...")
    const user = await User.findOne({ email })

    if (!user) {
      console.log("User not found:", email)
      return { success: false, message: "Invalid credentials" }
    }

    // For debugging
    console.log("Found user:", user.email, user.role)

    // Direct password comparison for default admin user
    let isMatch = false

    if (user.role === "admin" && email === "admin@example.com" && password === "admin123") {
      console.log("Using direct admin password comparison")
      isMatch = true
    } else {
      // Use the comparePassword method for other users
      try {
        console.log("Comparing password with bcrypt...")
        isMatch = await bcrypt.compare(password, user.password)
        console.log("Password comparison result:", isMatch)
      } catch (error) {
        console.error("Password comparison error:", error)
        return { success: false, message: "Authentication error" }
      }
    }

    if (!isMatch) {
      console.log("Password mismatch")
      return { success: false, message: "Invalid credentials" }
    }

    // Serialize the user object before signing the JWT
    console.log("Creating JWT token...")
    const userForToken = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    }

    const token = await signJWT(userForToken)
    console.log("JWT token created")

    console.log("Setting auth cookie...")
    await setAuthCookie(token)
    console.log("Auth cookie set")

    console.log("Login successful")
    return {
      success: true,
      user: userForToken,
    }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, message: error.message || "An error occurred during login" }
  }
}

export async function logout() {
  await removeAuthCookie()
  return { success: true }
}

// Initialize admin user if none exists
export async function initializeAdmin() {
  try {
    await connectDB()

    const adminExists = await User.findOne({ role: "admin" })

    if (!adminExists) {
      // Create admin with pre-hashed password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      await User.create({
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        name: "Admin User",
      })

      console.log("Admin user created")
    }

    return { success: true }
  } catch (error: any) {
    console.error("Failed to initialize admin:", error.message)
    return {
      success: false,
      message: "Database connection failed. Please check your MongoDB connection string.",
    }
  }
}

export async function createNewAdmin(formData: FormData) {
  try {
    console.log("Starting admin creation process...")

    // Connect to MongoDB
    console.log("Connecting to MongoDB...")
    await connectDB()
    console.log("MongoDB connection successful")

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log(`Creating admin with email: ${email}`)

    if (!name || !email || !password) {
      console.log("Missing required fields")
      return { success: false, message: "All fields are required" }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log("User already exists with this email")
      return { success: false, message: "An account with this email already exists" }
    }

    // Create the admin user
    console.log("Creating new admin user...")
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    })

    console.log("Admin user created successfully")

    // Automatically log in the new admin
    console.log("Creating JWT token for new admin...")
    const userForToken = {
      id: newAdmin._id.toString(),
      email: newAdmin.email,
      role: newAdmin.role,
      name: newAdmin.name,
    }

    const token = await signJWT(userForToken)
    console.log("JWT token created")

    console.log("Setting auth cookie...")
    await setAuthCookie(token)
    console.log("Auth cookie set")

    console.log("Admin creation and login successful")
    return {
      success: true,
      user: userForToken,
    }
  } catch (error: any) {
    console.error("Admin creation error:", error)
    return { success: false, message: error.message || "An error occurred during admin creation" }
  }
}

