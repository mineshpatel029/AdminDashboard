import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Admin from "@/lib/models/admin"
import User from "@/lib/models/user"
import mongoose from "mongoose"

// Get agents assigned to an admin
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const adminId = params.id

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return NextResponse.json({ success: false, message: "Invalid admin ID" }, { status: 400 })
    }

    const admin = await Admin.findById(adminId).populate("assignedAgents", "-password")

    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      agents: Array.isArray(admin.assignedAgents)
        ? admin.assignedAgents.map((agent: any) => ({
            id: agent._id ? agent._id.toString() : "",
            name: agent.name || "",
            email: agent.email || "",
            mobile: agent.mobile || "",
          }))
        : [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch assigned agents" },
      { status: 500 },
    )
  }
}

// Assign agents to an admin
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const adminId = params.id

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return NextResponse.json({ success: false, message: "Invalid admin ID" }, { status: 400 })
    }

    const admin = await Admin.findById(adminId)

    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 })
    }

    const { agentIds } = await request.json()

    if (!Array.isArray(agentIds)) {
      return NextResponse.json({ success: false, message: "agentIds must be an array" }, { status: 400 })
    }

    // Validate that all agent IDs exist
    const validAgentIds = []
    for (const id of agentIds) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const agent = await User.findOne({ _id: id, role: "agent" })
        if (agent) {
          validAgentIds.push(id)
        }
      }
    }

    // Update the admin's assigned agents
    admin.assignedAgents = validAgentIds
    await admin.save()

    return NextResponse.json({
      success: true,
      message: "Agents assigned successfully",
      assignedAgents: validAgentIds || [],
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to assign agents" }, { status: 500 })
  }
}

