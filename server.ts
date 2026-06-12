import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
 const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Proxy endpoint to consult Gemini API securely
  app.post("/api/analyze", async (req, res) => {
    try {
      const { systemPrompt, userMessage, temp = 0.7 } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "服务器未检测到 GEMINI_API_KEY。请在 Settings > Secrets 面板中配置您的密钥。",
          isKeyMissing: true,
        });
      }

      // Initialize GoogleGenAI SDK on demand
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userMessage,
        config: {
          systemInstruction: systemPrompt || "你是一位温暖、富有同理心的专业心理咨询师兼辅导员，字字诚恳温柔，善于倾听、共情、给出适度的身心调理建议。请务必用中文回复，排版清晰美观，可以使用一定的 Markdown 格式和空行以便于阅读。",
          temperature: temp,
        },
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API request failed:", err);
      res.status(500).json({ error: err.message || "请求 AI 心理助手时发生错误" });
    }
  });

  // Setup Hot-reloading Vite dev server in Development, and static assets in Production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development environment via Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production build from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Fatal: Server startup failed:", error);
});
