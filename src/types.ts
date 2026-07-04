export type Category = 'produce' | 'dairy' | 'protein' | 'pantry' | 'bakery' | 'other';

export interface Ingredient {
  id: string;
  name: string;
  category: Category;
  daysLeft: number; // days until expiration
  isExpiringSoon: boolean; // true if daysLeft <= 2
  quantity: string;
}

export interface RecipeIngredient {
  name: string;
  isExpiring: boolean;
  isPresent: boolean; // whether it exists in the active fridge inventory
}

export interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[]; // e.g., ["⏱️ Under 30 Mins", "💪 High-Protein", "🌱 Vegan", "🍲 One-Pot"]
  whyReducesWaste: string;
  ingredientsFridge: RecipeIngredient[];
  ingredientsPantry: string[];
  steps: string[];
  image: string;
  calories?: string;
}

export interface DemoPhotoPreset {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  ingredients: Omit<Ingredient, 'id'>[];
}
