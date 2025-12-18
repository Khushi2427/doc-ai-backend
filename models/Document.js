import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    url: String,
    fileType: String,
    summary: String
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
