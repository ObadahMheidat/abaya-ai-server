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
Create a luxury abaya design.

Color: ${input.fabric_color}
Embroidery: ${input.embroidery_style}
Placement: ${input.placement}
Silhouette: ${input.silhouette}
Occasion: ${input.occasion}

Return:

Design Name:
Description:
Factory Specs:
`;

    const response = await openai.chat.completions.create({

      model: "gpt-4o",

      messages: [
        { role: "user", content: prompt }
      ]

    });

    res.json({
      result: response.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to generate design"
    });

  }

});

app.listen(3000, () => {

  console.log("Server running at http://localhost:3000");

});
