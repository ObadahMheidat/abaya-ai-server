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

    const result = {
      result: response.choices[0].message.content
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