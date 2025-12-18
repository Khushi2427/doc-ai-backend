import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  key: { type: String, unique: true }
});

export default mongoose.model("ApiKey", apiKeySchema);
