const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ===== HEALTH CHECK ===== */
app.get("/", (req, res) => {
  res.send("Server is alive");
});

/* ===== MAIN AI ROUTE ===== */
app.post("/generate-design", async (req, res) => {

  try {

    const input = req.body;

    const prompt = `
You are a luxury abaya fashion designer.

Create a custom abaya design.

INPUT:
${JSON.stringify(input)}

Return ONLY valid JSON:

{
  "design_name": "",
  "description": "",
  "factory_specs": [
    "",
    "",
    ""
  ]
}

Rules:
- Elegant luxury design name
- Description 3-4 sentences
- Factory specs short production bullet points
- No markdown
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    res.json({
      result: response.choices[0].message.content
    });

  } catch (err) {

    console.log("AI ERROR:", err.message);

    res.status(500).json({
      error: "AI failed"
    });

  }

});

/* ===== RAILWAY SAFE PORT ===== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
