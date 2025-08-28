import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Recipe, FoundRecipe, GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeName: { type: Type.STRING, description: "The creative and appealing name of the recipe." },
        description: { type: Type.STRING, description: "A short, appetizing description of the dish (2-3 sentences)." },
        cookTime: { type: Type.STRING, description: "Estimated total cooking and prep time (e.g., '45 minutes')." },
        servings: { type: Type.STRING, description: "How many people this recipe serves (e.g., '4 servings')." },
        ingredients: {
            type: Type.OBJECT,
            properties: {
                provided: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of ingredients that the user already has. Use standard US units (e.g., cups, oz, lbs, F)."
                },
                needed: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of common staple ingredients the user might need (e.g., 'olive oil', 'salt', 'pepper'). Should be a short list. Use standard US units."
                }
            },
            required: ['provided', 'needed']
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step-by-step cooking instructions. Each step should be a separate string in the array. Use Fahrenheit for temperatures."
        },
        tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Optional tips for variations or serving suggestions."
        },
        nutrition: {
            type: Type.OBJECT,
            properties: {
                calories: { type: Type.STRING, description: "Estimated calories per serving (e.g., '550 kcal')." },
                protein: { type: Type.STRING, description: "Estimated protein per serving (e.g., '30g')." },
                carbs: { type: Type.STRING, description: "Estimated carbohydrates per serving (e.g., '45g')." },
                fat: { type: Type.STRING, description: "Estimated fat per serving (e.g., '20g')." }
            },
            required: ['calories', 'protein', 'carbs', 'fat']
        }
    },
    required: ['recipeName', 'description', 'cookTime', 'servings', 'ingredients', 'instructions', 'nutrition']
};

export const generateRecipe = async (
    ingredients: string[],
    dietary: string[],
    mealType: string,
    cuisine: string,
    difficulty: string
): Promise<Recipe> => {
    
    const prompt = `
        You are an expert chef and recipe creator. Your task is to create a delicious and creative recipe based on the following user-provided criteria.

        Ingredients available:
        - ${ingredients.join('\n- ')}

        Dietary Preferences: ${dietary.length > 0 ? dietary.join(', ') : 'None'}
        Meal Type: ${mealType}
        Cuisine Preference: ${cuisine || 'Any'}
        Desired Difficulty: ${difficulty}

        Please generate a complete recipe that primarily uses the ingredients provided. You can suggest a few common pantry staples if necessary (list them in the 'needed' ingredients section). The instructions should be clear, concise, and easy to follow. Make the recipe sound appealing and creative.

        IMPORTANT: You must use standard US units for all measurements (e.g., cups, oz, lbs) and Fahrenheit for all temperatures. Do not use metric units.
        You must also provide an estimated nutritional breakdown per serving for calories, protein, carbs, and fat.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        const recipeData = JSON.parse(jsonText);

        // Basic validation
        if (!recipeData.recipeName || !recipeData.instructions || !recipeData.nutrition) {
            throw new Error("Generated recipe is missing key fields.");
        }

        return recipeData as Recipe;

    } catch (error) {
        console.error("Error generating recipe:", error);
        throw new Error("Failed to generate a recipe. The AI chef might be busy. Please try again later.");
    }
};


export const generateRecipeImage = async (recipeName: string, description: string): Promise<string> => {
    const prompt = `
      A vibrant, high-resolution, photorealistic image of "${recipeName}".
      The dish is plated beautifully, looking extremely appetizing. 
      Description: ${description}.
      Style: Professional food photography, dramatic lighting, shallow depth of field.
    `;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }

    } catch (error) {
        console.error("Error generating image:", error);
        // Fallback to a placeholder
        return `https://source.unsplash.com/1280x720/?${encodeURIComponent(recipeName)}`;
    }
};

export const createChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are a friendly and helpful culinary assistant. Your name is 'Mnoma'. You can answer questions about cooking techniques, ingredient substitutions, recipe ideas, and general food knowledge. Keep your answers concise, encouraging, and easy for a beginner to understand.",
        },
    });
};

const foundRecipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipes: {
            type: Type.ARRAY,
            description: "An array of 2-3 recipes found from the web search.",
            items: {
                type: Type.OBJECT,
                properties: {
                    recipeName: { type: Type.STRING, description: "The name of the recipe." },
                    description: { type: Type.STRING, description: "A brief, one-sentence description of the dish." },
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the recipe's ingredients." },
                    instructions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The step-by-step instructions for the recipe." }
                },
                required: ['recipeName', 'description', 'ingredients', 'instructions']
            }
        }
    },
    required: ['recipes']
};


export const findRecipesFromWeb = async (query: string): Promise<{ recipes: FoundRecipe[], sources: GroundingSource[] }> => {
    const prompt = `
        You are a recipe curator. Find 2-3 of the best and most highly-rated recipes from the web for "${query}".
        Summarize each recipe by providing its name, a brief description, a list of ingredients, and the cooking instructions.
        Ensure the results are distinct and from different sources if possible.

        IMPORTANT: You MUST format your entire response as a single JSON object. The object should have a key "recipes" which is an array of recipe objects.
        Each recipe object must contain the following keys: "recipeName" (string), "description" (string), "ingredients" (an array of strings), and "instructions" (an array of strings).

        If you cannot find any recipes, return a JSON object with an empty "recipes" array: {"recipes": []}. Do not add any explanatory text before or after the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                // FIX: Removed responseMimeType and responseSchema as they are unsupported with the googleSearch tool.
                // The prompt now instructs the model to return JSON directly.
            },
        });

        // The response text needs to be cleaned and parsed as JSON.
        let jsonText = response.text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
        
        const data = JSON.parse(jsonText);
        const recipes: FoundRecipe[] = data.recipes || [];
        
        const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        if (recipes.length === 0) {
            throw new Error("No recipes were found for your query.");
        }

        return { recipes, sources };

    } catch (error) {
        console.error("Error finding recipes:", error);
        if (error instanceof SyntaxError) {
             // This happens if the model response isn't valid JSON
            throw new Error("Sorry, the recipe search returned an unexpected format. Please try a different search term.");
        }
        // Re-throw other errors with a generic message.
        throw new Error("Sorry, I couldn't find any recipes for that. Please try a different search.");
    }
};