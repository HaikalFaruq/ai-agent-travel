import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// Fungsi Controller
export const sendMessage = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Kreatif: Tambahkan parameter konfigurasi
    const generationConfig = {
      temperature: 0.7, // gaya respons (0 = kaku, 1 = kreatif)
      maxOutputTokens: 300,
      topK: 40,
      topP: 0.8,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const output = result.response.text();
    res.json({ reply: output });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};
