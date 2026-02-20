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

/* ===== SIMPLE MEMORY CACHE ===== */
const designCache = {};

/* HEALTH CHECK */
app.get("/", (req,res)=>{
  res.send("Server working + OpenAI ready");
});

/* AI DESIGN ROUTE */
app.post("/generate-design", async (req, res) => {

  try {

    const input = req.body;
    const cacheKey = JSON.stringify(input);

    /* ===== RETURN CACHE IF EXISTS ===== */
    if (designCache[cacheKey]) {
      console.log("⚡ Returning cached design");
      return res.json(designCache[cacheKey]);
    }

    const prompt = `
Create luxury abaya design JSON.

INPUT:
${JSON.stringify(input)}

Return ONLY valid JSON:

{
  "design_name":"",
  "description":"",
  "factory_specs":[]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role:"user", content: prompt }
      ],
      temperature: 0.7
    });

let imageUrl = null;

/* ===== SAFE IMAGE GENERATION ===== */
try {

  const imagePrompt = `
Luxury abaya fashion photography.
Color: ${input.fabric_color}
Embroidery: ${input.embroidery_style}
Placement: ${input.placement}
Silhouette: ${input.silhouette}
Occasion: ${input.occasion}.
Full body mannequin, elegant studio background, premium fashion catalog style.
`;

  const imageResponse = await openai.images.generate({
    model: "gpt-image-1",
    prompt: imagePrompt,
    size: "1024x1024"
  });

if (imageResponse.data[0].url) {
  imageUrl = imageResponse.data[0].url;
} else if (imageResponse.data[0].b64_json) {
  imageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
}

  console.log("🖼 Image generated");

} catch(imgErr){

  console.log("Image skipped:", imgErr.message);

}

const result = {
  result: response.choices[0].message.content,
  image: imageUrl
};

    /* ===== SAVE TO CACHE ===== */
    designCache[cacheKey] = result;

    console.log("💾 Saved new design in cache");

    res.json(result);

  } catch (err) {

    console.log("AI ERROR:", err.message);

    res.status(500).json({
      error: "AI failed"
    });

  }

});

/* RAILWAY SAFE PORT */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", ()=>{
  console.log("Running on", PORT);
});