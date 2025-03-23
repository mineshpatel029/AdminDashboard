import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IAdmin extends Document {
  email: string
  password: string
  name?: string
  assignedAgents: mongoose.Types.ObjectId[] // Array of agent IDs assigned to this admin
  comparePassword(candidatePassword: string): Promise<boolean>
}

const AdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    assignedAgents: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
)

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare password
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    console.error("Error comparing password:", error)
    return false
  }
}

// Check if the model already exists to prevent overwriting
const Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema)

export default Admin

