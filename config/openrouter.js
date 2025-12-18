import axios from "axios";

export const openrouterClient = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json"
  }
});
