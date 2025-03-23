import mongoose, { Schema, type Document } from "mongoose"

export interface IListItem extends Document {
  firstName: string
  phone: string
  notes: string
  assignedTo: mongoose.Types.ObjectId
}

const ListItemSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.models.ListItem || mongoose.model<IListItem>("ListItem", ListItemSchema)

