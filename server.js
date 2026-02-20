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

app.get("/", (req,res)=>{
  res.send("Server is alive");
});

app.post("/generate-design", async (req, res) => {

  try {

    const input = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role:"user",
        content:`Create luxury abaya design JSON using:
        ${JSON.stringify(input)}`
      }]
    });

    res.json({
      result: response.choices[0].message.content
    });

  } catch(err){

    console.log(err);
    res.status(500).json({error:"AI failed"});

  }

});

const PORT = process.env.PORT || 3000;

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

