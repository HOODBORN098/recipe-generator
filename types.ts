export interface Nutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  cookTime: string;
  servings: string;
  ingredients: {
    provided: string[];
    needed: string[];
  };
  instructions: string[];
  tips: string[];
  nutrition: Nutrition;
}

export interface SavedRecipe extends Recipe {
  id: string;
  imageUrl: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// For recipes found via web search
export interface FoundRecipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export interface GroundingSource {
    // FIX: The `web` property is optional in the Gemini API's `GroundingChunk` type.
    // This aligns our local type with the API response and prevents type errors.
    web?: {
        uri?: string;
        title?: string;
    }
}