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

    /* =========================
       TEXT DESIGN GENERATION
    ========================== */

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
- Return ONLY valid JSON.
`;

    const response = await openai.chat.completions.create({

      model: "gpt-4o",

      messages: [
        { role: "user", content: prompt }
      ],

      temperature: 0.8

    });

    const output = response.choices[0].message.content;

    /* =========================
       IMAGE GENERATION (NEW)
    ========================== */

    const imagePrompt = `
Luxury abaya fashion design.
Color: ${input.fabric_color}
Embroidery: ${input.embroidery_style}
Placement: ${input.placement}
Silhouette: ${input.silhouette}
Occasion: ${input.occasion}.
Elegant full body mannequin, studio fashion photography,
minimal white background, premium modest fashion style.
`;

    const imageResponse = await openai.images.generate({

      model: "gpt-image-1",
      prompt: imagePrompt,
      size: "1024x1024"

    });

    const imageUrl = imageResponse.data[0].url;

    /* =========================
       FINAL RESPONSE
    ========================== */

    res.json({
      result: output,
      image: imageUrl
    });

  } catch (error) {

    console.error("OpenAI Error:", error);

    res.status(500).json({
      error: "Failed to generate design"
    });

  }

});

/* Railway SAFE PORT */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
