"use server"

import { parse } from "papaparse"
import connectDB from "../db"
import User from "../models/user"
import Admin from "../models/admin"
import ListItem from "../models/list-item"
import { requireAdmin, getCurrentUser } from "../auth"

// Helper function to get agents for the current admin
async function getAgentsForCurrentAdmin() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    throw new Error("Not authenticated")
  }

  // Check if the user is from the Admin collection
  const admin = await Admin.findOne({ email: currentUser.email })

  if (admin) {
    // If admin is from Admin collection, return only assigned agents
    return User.find({
      _id: { $in: admin.assignedAgents },
      role: "agent",
    })
  }

  // If admin is from User collection (legacy), return all agents
  return User.find({ role: "agent" })
}

export async function uploadAndDistributeList(formData: FormData) {
  try {
    await requireAdmin()
    await connectDB()

    const file = formData.get("file") as File

    if (!file) {
      return { success: false, message: "No file uploaded" }
    }

    // Validate file type
    const fileType = file.name.split(".").pop()?.toLowerCase()
    if (!["csv", "xlsx", "xls"].includes(fileType || "")) {
      return { success: false, message: "Only CSV, XLSX, and XLS files are allowed" }
    }

    // For simplicity, we'll only handle CSV files in this example
    if (fileType !== "csv") {
      return { success: false, message: "Only CSV files are supported in this demo" }
    }

    const fileContent = await file.text()

    // Parse CSV
    const { data, errors } = parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (errors.length > 0) {
      return { success: false, message: "Error parsing CSV file" }
    }

    // Validate CSV structure
    const requiredFields = ["FirstName", "Phone", "Notes"]
    const hasRequiredFields = requiredFields.every((field) => Object.keys(data[0]).includes(field))

    if (!hasRequiredFields) {
      return {
        success: false,
        message: "CSV must include FirstName, Phone, and Notes columns",
      }
    }

    // Get agents for the current admin
    const agents = await getAgentsForCurrentAdmin()

    if (agents.length === 0) {
      return { success: false, message: "No agents found to distribute lists" }
    }

    // Clear previous assignments for these agents
    const agentIds = agents.map((agent) => agent._id)
    await ListItem.deleteMany({ assignedTo: { $in: agentIds } })

    // Distribute items among agents
    const items = data as { FirstName: string; Phone: string; Notes: string }[]
    const agentCount = agents.length
    const itemsPerAgent = Math.floor(items.length / agentCount)
    const remainingItems = items.length % agentCount

    let currentIndex = 0

    for (let i = 0; i < agentCount; i++) {
      const agent = agents[i]
      const itemCount = i < remainingItems ? itemsPerAgent + 1 : itemsPerAgent

      for (let j = 0; j < itemCount; j++) {
        if (currentIndex < items.length) {
          const item = items[currentIndex]

          await ListItem.create({
            firstName: item.FirstName,
            phone: item.Phone,
            notes: item.Notes,
            assignedTo: agent._id,
          })

          currentIndex++
        }
      }
    }

    return { success: true, message: `${items.length} items distributed among ${agentCount} agents` }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getDistributedLists() {
  try {
    await requireAdmin()
    await connectDB()

    // Get agents for the current admin
    const agents = await getAgentsForCurrentAdmin()

    const agentData = await Promise.all(
      agents.map(async (agent) => {
        const items = await ListItem.find({ assignedTo: agent._id })

        // Serialize the items to plain objects
        const serializedItems = items.map((item) => ({
          id: item._id.toString(),
          firstName: item.firstName,
          phone: item.phone,
          notes: item.notes,
        }))

        return {
          id: agent._id.toString(),
          name: agent.name,
          email: agent.email,
          items: serializedItems,
        }
      }),
    )

    return { success: true, agentData }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

