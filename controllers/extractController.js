import axios from "axios";
import { Parser } from "json2csv";

// ===============================
// SUMMARY
// ===============================
export const summarizeDocument = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL required" });

    const aiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-4-maverick",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Summarize the content written in this document image." },
              { type: "image_url", image_url: { url } }
            ]
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      summary: aiRes.data.choices?.[0]?.message?.content || "No summary generated"
    });

  } catch (err) {
    res.status(500).json({ message: "Summary failed" });
  }
};

// ===============================
// DETAILS
// ===============================
export const extractDetails = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL required" });

    const aiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-4-maverick",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Extract text, tables, and named entities.
Return JSON only:
{
  "text": "",
  "entities": [],
  "tables": []
}
`
              },
              { type: "image_url", image_url: { url } }
            ]
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let parsed;
    try {
      parsed = JSON.parse(aiRes.data.choices[0].message.content);
    } catch {
      parsed = { text: aiRes.data.choices[0].message.content, entities: [], tables: [] };
    }

    res.json(parsed);

  } catch (err) {
    res.status(500).json({ message: "Extraction failed" });
  }
};

// ===============================
// JSON → CSV (FIXED)
// ===============================
export const convertToCsv = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ message: "No JSON data received" });
    }

    /**
     * FLATTEN DATA FOR CSV
     * CSV works only with array of flat objects
     */
    const rows = [];

    // Text
    if (data.text) {
      rows.push({
        type: "Text",
        key: "content",
        value: data.text
      });
    }

    // Entities
    if (Array.isArray(data.entities)) {
      data.entities.forEach((ent, i) => {
        rows.push({
          type: "Entity",
          key: `entity_${i + 1}`,
          value: JSON.stringify(ent)
        });
      });
    }

    // Tables
    if (Array.isArray(data.tables)) {
      data.tables.forEach((table, i) => {
        rows.push({
          type: "Table",
          key: `table_${i + 1}`,
          value: JSON.stringify(table)
        });
      });
    }

    const parser = new Parser({
      fields: ["type", "key", "value"]
    });

    const csv = parser.parse(rows);

    // ✅ SEND CSV DIRECTLY
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=extracted_data.csv"
    );

    res.status(200).send(csv);

  } catch (error) {
    console.error("CSV ERROR:", error);
    res.status(500).json({ message: "CSV conversion failed" });
  }
};
