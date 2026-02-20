const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/generate-design", async (req, res) => {

  try {

    const input = req.body;

    /* ===================
       TEXT GENERATION
    ==================== */

    const prompt = `
You are a luxury abaya designer.

Color: ${input.fabric_color}
Embroidery: ${input.embroidery_style}
Placement: ${input.placement}
Silhouette: ${input.silhouette}
Occasion: ${input.occasion}

Return ONLY valid JSON:

{
 "design_name":"",
 "description":"",
 "factory_specs":[]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });

    const output = response.choices[0].message.content;

    /* ===================
       IMAGE GENERATION SAFE
    ==================== */

    let imageUrl = null;

    try {

      const imageResponse = await openai.images.generate({
        model: "gpt-image-1",
        prompt: `Luxury abaya fashion photo, ${input.fabric_color}, studio background`,
        size: "1024x1024"
      });

      imageUrl = imageResponse.data[0].url;

    } catch (imgError) {

      console.log("Image generation skipped:", imgError.message);

    }

    res.json({
      result: output,
      image: imageUrl
    });

  } catch (error) {

    console.log("Main error:", error.message);

    res.status(500).json({
      error: "Failed to generate design"
    });

  }

});

/* RAILWAY PORT FIX */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
