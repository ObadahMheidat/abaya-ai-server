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

/* ===============================
   MEMORY STORAGE (MVP VERSION)
================================ */

const designCache = {};
const designStore = [];

/* ===============================
   HEALTH CHECK
================================ */

app.get("/", (req,res)=>{
  res.send("Server working + OpenAI ready");
});

/* ===============================
   AI DESIGN GENERATION
================================ */

app.post("/generate-design", async (req, res) => {

  try {

    const input = req.body;
    const cacheKey = JSON.stringify(input);

    /* CACHE */
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
      messages:[{ role:"user", content: prompt }],
      temperature:0.7
    });

    /* IMAGE GENERATION */
    let imageUrl = null;

    try {

      const imagePrompt = `
Luxury abaya fashion photography.
Color: ${input.fabric_color}
Embroidery: ${input.embroidery_style}
Placement: ${input.placement}
Silhouette: ${input.silhouette}
Occasion: ${input.occasion}.
Full body mannequin, premium fashion catalog style.
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

    designCache[cacheKey] = result;

    res.json(result);

  } catch (err) {

    console.log("AI ERROR:", err.message);

    res.status(500).json({
      error:"AI failed"
    });

  }

});

/* ===============================
   SAVE DESIGN (PUBLISH)
================================ */

app.post("/save-design", (req,res)=>{

  try{

    const d = req.body;

    const newDesign = {
      id: Date.now(),
      name: d.name,
      description: d.description,
      image: d.image,
      points: 0,

      /* ECONOMY */
      purchased: false,
      designer_status: "designer",

      created: new Date()
    };

    designStore.push(newDesign);

    res.json({
      success:true,
      design:newDesign
    });

  } catch(err){

    res.status(500).json({
      error:"Save failed"
    });

  }

});

/* ===============================
   GET MARKETPLACE DESIGNS
================================ */

app.get("/designs", (req,res)=>{
  res.json(designStore);
});

/* ===============================
   LOAD SINGLE DESIGN
================================ */

app.get("/design/:id", (req,res)=>{

  const found = designStore.find(
    d => d.id == req.params.id
  );

  if(!found){
    return res.status(404).json({
      error:"Design not found"
    });
  }

  res.json(found);

});

/* ===============================
   PURCHASE (VERIFY DESIGNER)
================================ */

app.post("/purchase/:id", (req,res)=>{

  const design = designStore.find(
    d => d.id == req.params.id
  );

  if(!design){
    return res.status(404).json({
      error:"Design not found"
    });
  }

  design.purchased = true;
  design.designer_status = "verified";

  res.json({
    success:true,
    message:"Designer verified",
    design
  });

});

/* ===============================
   SERVER START
================================ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", ()=>{
  console.log("Running on", PORT);
});