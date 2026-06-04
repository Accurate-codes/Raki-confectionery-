/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Passive/Lazy Gemini AI setup
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // ==========================================
  // API Routes First
  // ==========================================

  // Check API health status
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Integrated AI custom cake recommendation endpoint
  app.post("/api/ai/plan-cake", async (req: Request, res: Response): Promise<void> => {
    try {
      const { guestCount, shapes, themeColor, eventDescription } = req.body;

      if (!guestCount || !shapes || !themeColor || !eventDescription) {
        res.status(400).json({ error: "Missing required preferences parameters." });
        return;
      }

      const client = getGeminiClient();

      const userPrompt = `
        A customer is requesting a custom-designed cake from Rakis Confectionery (a high-end confectionery in Nigeria).
        Here are their preferences:
        - Guest party count: ${guestCount} users/guests
        - Preferred cake shape style: ${shapes}
        - Desired theme color: ${themeColor}
        - Event details & additional notes: ${eventDescription}

        Based on these, generate a highly professional, stylish, and premium custom cake concept recommendation.
        Tailor the sizing so that there are enough slices (estimated slices) for ${guestCount} guests.
        Provide a realistic price estimate in Nigerian Naira (NGN), reflecting custom bakery rates in Lagos/Nigeria (e.g., standard 1-tier custom cakes range from 25,000 to 45,000 NGN, 2-tier from 50,000 to 90,000 NGN, 3-tier and premium tiered shapes from 95,000 to 180,000 NGN). Please keep the estimated price mathematically aligned with these reasonable limits.
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: `You are Rakis, the master pastry chef and confectioner of Rakis Confectionery. Your goal is to guide customers into creating the perfect luxury celebration cakes, cupcakes, or desserts. Provide an exquisite culinary recommendation that feels high-end, premium, and personalized. Output your recommendation strictly as JSON matching the requested schema.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cakeConceptName: {
                type: Type.STRING,
                description: "A gorgeous, creative, or descriptive name of this custom cake concept."
              },
              recommendationText: {
                type: Type.STRING,
                description: "Chef's gourmet description and decoration suggestions for the custom cake, incorporating theme colors and textures."
              },
              suggestedTiers: {
                type: Type.INTEGER,
                description: "Appropriate number of tiers recommended to feed the guests (usually 1 for small parties up to 25 guests, 2 for 30-70 guests, 3+ for larger wedding parties)."
              },
              estimatedSlices: {
                type: Type.INTEGER,
                description: "Total slices suggested."
              },
              suggestedSize: {
                type: Type.STRING,
                description: "Sizing dimensions, e.g. '8-inch base tier' or '10-inch base + 6-inch top tier'."
              },
              suggestedFlavors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 2-3 matching gourmet flavors (e.g., Chocolate Drip, Red Velvet Cream, Vanilla Velvet, Carrot Zest)."
              },
              suggestedPriceInNaira: {
                type: Type.INTEGER,
                description: "Calculated starting price estimation in NGN for this size and decoration level."
              }
            },
            required: [
              "cakeConceptName",
              "recommendationText",
              "suggestedTiers",
              "estimatedSlices",
              "suggestedSize",
              "suggestedFlavors",
              "suggestedPriceInNaira"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from artificial intelligence platform.");
      }

      res.setHeader("Content-Type", "application/json");
      res.send(responseText.trim());
    } catch (error) {
      console.error("Gemini Confectionery Assistant Error:", error);
      res.status(500).json({
        error: "Failed to design cake recommendation with AI assistant",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // ==========================================
  // Vite Dev Server / Static Hosting setup
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Rakis Confectionery Backend] Service running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
