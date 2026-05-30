const fs = require('fs');
const path = require('path');

// Manually parse .env.local
try {
  const envContent = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*["']?([^"'\s]+)["']?/);
    if (match) {
      process.env.GEMINI_API_KEY = match[1];
      break;
    }
  }
} catch (e) {
  console.log("Could not read .env.local:", e.message);
}

console.log("Loaded GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "CONFIGURED (Starts with: " + process.env.GEMINI_API_KEY.substring(0, 10) + "...)" : "MISSING");

const { GoogleGenAI } = require('@google/genai');

if (!process.env.GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not defined.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Escreva um oi curto e fofo de cupido.',
    });
    console.log("Success response:", response.text);
  } catch (err) {
    console.error("API Call failed:", err);
  }
}

run();
