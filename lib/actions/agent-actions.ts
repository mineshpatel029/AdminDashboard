"use server"

import connectDB from "../db"
import User from "../models/user"
import Admin from "../models/admin"
import { requireAdmin, getCurrentUser } from "../auth"
import type mongoose from "mongoose"

// Helper function to convert MongoDB documents to plain objects
function serializeDocument(doc: any) {
  if (!doc) return null
  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item))
  }
  if (doc.toObject) {
    const obj = doc.toObject()
    // Convert MongoDB ObjectId to string
    if (obj._id) {
      obj.id = obj._id.toString()
      delete obj._id
    }
    return obj
  }
  if (typeof doc === "object" && doc !== null) {
    const newObj: any = {}
    for (const key in doc) {
      if (key === "_id") {
        newObj.id = doc._id.toString()
      } else if (
        doc[key] !== undefined &&
        doc[key] !== null &&
        typeof doc[key] === "object" &&
        "_bsontype" in doc[key]
      ) {
        // Handle ObjectId or other BSON types
        newObj[key] = doc[key].toString()
      } else {
        newObj[key] = serializeDocument(doc[key])
      }
    }
    return newObj
  }
  return doc
}

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

export async function createAgent(formData: FormData) {
  try {
    await requireAdmin()
    await connectDB()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const mobile = formData.get("mobile") as string
    const password = formData.get("password") as string

    if (!name || !email || !mobile || !password) {
      return { success: false, message: "All fields are required" }
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return { success: false, message: "Email already in use" }
    }

    const agent = await User.create({
      name,
      email,
      mobile,
      password,
      role: "agent",
    })

    // If the current admin is from the Admin collection, assign this agent to them
    const currentUser = await getCurrentUser()
    if (currentUser) {
      const admin = await Admin.findOne({ email: currentUser.email })
      if (admin) {
        admin.assignedAgents.push(agent._id)
        await admin.save()
      }
    }

    return {
      success: true,
      agent: {
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile,
      },
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function getAgents() {
  try {
    await requireAdmin()
    await connectDB()

    // Get agents for the current admin
    const agents = await getAgentsForCurrentAdmin()

    // Serialize the agents to plain objects
    const serializedAgents = agents.map((agent) => ({
      id: agent._id.toString(),
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
    }))

    return {
      success: true,
      agents: serializedAgents,
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export async function deleteAgent(formData: FormData) {
  try {
    await requireAdmin()
    await connectDB()

    const id = formData.get("id") as string

    if (!id) {
      return { success: false, message: "Agent ID is required" }
    }

    // Check if the agent is assigned to the current admin
    const currentUser = await getCurrentUser()
    if (currentUser) {
      const admin = await Admin.findOne({ email: currentUser.email })
      if (admin) {
        const isAssigned = admin.assignedAgents.some((agentId: mongoose.Types.ObjectId) => agentId.toString() === id)

        if (!isAssigned) {
          return { success: false, message: "You don't have permission to delete this agent" }
        }

        // Remove the agent from the admin's assigned agents
        admin.assignedAgents = admin.assignedAgents.filter(
          (agentId: mongoose.Types.ObjectId) => agentId.toString() !== id,
        )
        await admin.save()
      }
    }

    await User.findByIdAndDelete(id)

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

