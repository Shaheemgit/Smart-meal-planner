import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for recipe generation using Gemini
  app.post('/api/generate-recipes', async (req, res) => {
    try {
      const { ingredients } = req.body;
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'No ingredients provided.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY environment variable is missing on the server. Please check Settings > Secrets.' 
        });
      }

      // Lazy initialization of Gemini client
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Prepare a neat prompt describing the available ingredients
      const expiringItems = ingredients
        .filter(i => i.isExpiringSoon)
        .map(i => `${i.name} (${i.quantity || 'some'}, expires in ${i.daysLeft} days)`);
      const normalItems = ingredients
        .filter(i => !i.isExpiringSoon)
        .map(i => `${i.name} (${i.quantity || 'some'})`);

      const prompt = `You are an expert, eco-conscious culinary chef specializing in zero-waste cooking. 
Given the following ingredients in the user's kitchen, generate 2-3 creative, delicious, and realistic recipes that maximize the use of the expiring items and reduce food waste.

EXPIRING ITEMS (CRITICAL - prioritize using these):
${expiringItems.length > 0 ? expiringItems.join(', ') : 'None'}

OTHER FRIDGE/PANTRY ITEMS:
${normalItems.length > 0 ? normalItems.join(', ') : 'None'}

Requirements:
1. Maximize the usage of the expiring items.
2. The recipes must be realistic to cook with standard kitchen equipment.
3. Choose a beautiful, food-related Unsplash image URL (e.g., https://images.unsplash.com/photo-...) for the 'image' property.
4. Difficulty must be exactly 'Easy', 'Medium', or 'Hard'.
5. Each ingredientsFridge item in the recipe must correspond to the user's fridge items. Set 'isPresent' to true.
6. Provide clear, logical cooking steps.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an award-winning zero-waste chef. You only output valid JSON representing an array of recipes matching the specified schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'A unique slug string like "ai_recipe_avocado_scramble".' },
                title: { type: Type.STRING, description: 'Title of the recipe.' },
                prepTime: { type: Type.STRING, description: 'Preparation time, e.g., "15 Mins", "25 Mins".' },
                difficulty: { type: Type.STRING, description: 'Must be exactly "Easy", "Medium", or "Hard".' },
                tags: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: 'Tags, e.g., ["⏱️ Under 30 Mins", "💪 High-Protein", "🌱 Vegan"].'
                },
                whyReducesWaste: { type: Type.STRING, description: 'Explanation of how this recipe rescues specific expiring ingredients.' },
                ingredientsFridge: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: 'Name of the fridge ingredient used.' },
                      isExpiring: { type: Type.BOOLEAN, description: 'Whether this ingredient was marked as expiring.' },
                      isPresent: { type: Type.BOOLEAN, description: 'Must be true.' }
                    },
                    required: ['name', 'isExpiring', 'isPresent']
                  }
                },
                ingredientsPantry: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: 'List of common pantry staples required, e.g., ["Salt", "Black pepper", "Olive oil"].'
                },
                steps: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: 'Step-by-step instructions.'
                },
                image: { type: Type.STRING, description: 'A valid, beautiful high-quality Unsplash food photo URL representing this dish.' },
                calories: { type: Type.STRING, description: 'Estimated calories, e.g., "280 kcal".' }
              },
              required: ['id', 'title', 'prepTime', 'difficulty', 'tags', 'whyReducesWaste', 'ingredientsFridge', 'ingredientsPantry', 'steps', 'image']
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('No text response received from Gemini model.');
      }

      const recipes = JSON.parse(responseText.trim());
      res.json({ recipes });

    } catch (err: any) {
      console.error('Gemini recipe generation error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate recipes. Please try again.' });
    }
  });

  // Serve static files in production or route to Vite in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
