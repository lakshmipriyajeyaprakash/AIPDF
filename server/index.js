require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store extracted PDF text in memory
let pdfText = "";

// Multer setup — store uploaded file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

// Route 1 — Upload PDF
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const data = await pdfParse(req.file.buffer);
    pdfText = data.text;

    res.json({ message: "PDF uploaded successfully", pages: data.numpages });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

// Route 2 — Chat with PDF
app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;

    if (!pdfText) {
      return res.status(400).json({ error: "No PDF uploaded yet" });
    }

    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const prompt = `You are a helpful assistant. The user has uploaded a PDF. Use the PDF content as your primary source to answer the question. If the PDF does not contain enough information to answer, use your own knowledge but mention that the answer is not in the PDF.

PDF Content:
${pdfText}

User Question: ${question}

Answer clearly and concisely.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to get answer" });
  }
});

// Route 3 — Generate Quiz
app.post("/quiz", async (req, res) => {
  try {
    if (!pdfText) {
      return res.status(400).json({ error: "No PDF uploaded yet" });
    }

    const prompt = `Generate a quiz based on the following PDF content. Create exactly 10 questions: 7 multiple choice and 2 true/false.

Return ONLY a valid JSON array with this exact structure, no extra text:
[
  {
    "type": "multiple",
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "answer": "A) Option 1"
  },
  {
    "type": "truefalse",
    "question": "Statement here.",
    "options": ["True", "False"],
    "answer": "True"
  }
]

PDF Content:
${pdfText}

Return only the JSON array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Strip markdown code fences if present, then extract JSON array
    const stripped = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");
    const jsonMatch = stripped.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Raw Gemini response:", text);
      return res.status(500).json({ error: "Failed to parse quiz response" });
    }

    const questions = JSON.parse(jsonMatch[0]);
    res.json({ questions });
  } catch (error) {
    console.error("Quiz error:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
