const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config({ override: true });

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/generate-design", async (req, res) => {

  try {

    const input = req.body;

    const prompt = `
You are a luxury abaya fashion designer for Abaya Plaza.

Create a premium custom abaya design.

INPUT:
Color: ${input.fabric_color}
Embroidery: ${input.embroidery_style}
Placement: ${input.placement}
Silhouette: ${input.silhouette}
Occasion: ${input.occasion}

RETURN STRICT JSON FORMAT ONLY:

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
- Design name must sound luxury and elegant.
- Description must feel premium and emotional (3-5 sentences).
- Factory specs must be short production-ready bullet points.
- DO NOT add markdown.
- DO NOT add extra text outside JSON.
- DO NOT add code fences
- Return ONLY valid JSON
`;

    const response = await openai.chat.completions.create({

      model: "gpt-4o",

      messages: [
        { role: "user", content: prompt }
      ],

      temperature: 0.8

    });

    const output = response.choices[0].message.content;

    res.json({
      result: output
    });

  } catch (error) {

    console.error("OpenAI Error:", error);

    res.status(500).json({
      error: "Failed to generate design"
    });

  }

});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
