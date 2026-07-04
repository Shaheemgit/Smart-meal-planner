import { Ingredient, Recipe, DemoPhotoPreset } from './types';

// High-quality icons/emoji categories for styling
export const CATEGORY_THEMES = {
  produce: { label: 'Produce', emoji: '🌱', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  dairy: { label: 'Dairy', emoji: '🥛', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  protein: { label: 'Protein', emoji: '🍖', bg: 'bg-red-50 text-red-700 border-red-200' },
  pantry: { label: 'Pantry', emoji: '🥫', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  bakery: { label: 'Bakery', emoji: '🍞', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  other: { label: 'Other', emoji: '🍽️', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const RECIPE_FILTERS = [
  { id: 'all', label: 'All Recipes', emoji: '🍽️' },
  { id: 'under30', label: '⏱️ Under 30 Mins', filterTag: '⏱️ Under 30 Mins' },
  { id: 'highprotein', label: '💪 High-Protein', filterTag: '💪 High-Protein' },
  { id: 'vegan', label: '🌱 Vegan', filterTag: '🌱 Vegan' },
  { id: 'onepot', label: '🍲 One-Pot', filterTag: '🍲 One-Pot' }
];

export const DEMO_PRESETS: DemoPhotoPreset[] = [
  {
    id: 'green_goddess',
    name: 'Fresh Veggies & Eggs',
    description: 'Perfect for a healthy Mediterranean-style breakfast or lunch.',
    thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    ingredients: [
      { name: 'Wilting Spinach', category: 'produce', daysLeft: 1, isExpiringSoon: true, quantity: '1 half-empty bag' },
      { name: 'Soft Tomatoes', category: 'produce', daysLeft: 2, isExpiringSoon: true, quantity: '3 medium' },
      { name: 'Fresh Garlic', category: 'produce', daysLeft: 10, isExpiringSoon: false, quantity: '1 head' },
      { name: 'Onions', category: 'produce', daysLeft: 14, isExpiringSoon: false, quantity: '2 whole' },
      { name: 'Fresh Eggs', category: 'protein', daysLeft: 8, isExpiringSoon: false, quantity: '6 items' },
    ]
  },
  {
    id: 'sweet_baker',
    name: 'Fruit & Dairy Basket',
    description: 'Great for naturally sweetened breakfast bakes and oat bowls.',
    thumbnail: 'https://images.unsplash.com/photo-1610832958506-ee5633619141?auto=format&fit=crop&q=80&w=600',
    ingredients: [
      { name: 'Browning Bananas', category: 'produce', daysLeft: 1, isExpiringSoon: true, quantity: '3 overripe' },
      { name: 'Greek Yogurt', category: 'dairy', daysLeft: 2, isExpiringSoon: true, quantity: '1 tub (150g)' },
      { name: 'Almond Milk', category: 'dairy', daysLeft: 5, isExpiringSoon: false, quantity: '1 carton' },
      { name: 'Walnuts', category: 'pantry', daysLeft: 30, isExpiringSoon: false, quantity: '1 small pouch' },
    ]
  },
  {
    id: 'weekend_leftovers',
    name: 'Roasted Chicken & Bread',
    description: 'Savory comfort foods using remaining staples and meat.',
    thumbnail: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=600',
    ingredients: [
      { name: 'Roasted Chicken', category: 'protein', daysLeft: 1, isExpiringSoon: true, quantity: '200g leftover shredded' },
      { name: 'Stale Bread', category: 'bakery', daysLeft: 2, isExpiringSoon: true, quantity: '4 thick slices' },
      { name: 'Bell Peppers', category: 'produce', daysLeft: 3, isExpiringSoon: false, quantity: '2 medium' },
      { name: 'Cheddar Cheese', category: 'dairy', daysLeft: 6, isExpiringSoon: false, quantity: '100g grated' },
      { name: 'Onions', category: 'produce', daysLeft: 12, isExpiringSoon: false, quantity: '1 whole' },
    ]
  }
];

export const PRESET_RECIPES: Recipe[] = [
  {
    id: 'recipe_1',
    title: 'Crispy Spinach & Tomato Frittata',
    prepTime: '15 Mins',
    difficulty: 'Easy',
    tags: ['⏱️ Under 30 Mins', '💪 High-Protein', '🍲 One-Pot'],
    whyReducesWaste: 'Saves wilted greens and soft, watery tomatoes from leaking and spoiling. Pan-frying soft tomatoes concentrates their sweet sugars perfectly!',
    ingredientsFridge: [
      { name: 'Wilting Spinach', isExpiring: true, isPresent: false },
      { name: 'Soft Tomatoes', isExpiring: true, isPresent: false },
      { name: 'Fresh Eggs', isExpiring: false, isPresent: false }
    ],
    ingredientsPantry: ['Olive oil', 'Salt', 'Black pepper', 'Garlic powder'],
    steps: [
      'Whisk 4-6 eggs in a bowl with a pinch of salt, black pepper, and garlic powder until fluffy.',
      'Heat 1 tbsp of olive oil in a non-stick skillet over medium heat. Add chopped Soft Tomatoes and Wilting Spinach. Sauté for 2-3 minutes until spinach is wilted and tomato moisture starts cooking off.',
      'Pour the whisked eggs directly over the vegetables, swirling the pan to distribute them evenly.',
      'Cook on medium-low heat for 5 minutes until the base and edges are set. If you can, cover the pan for 3 minutes, or transfer to an oven broiler for 2 minutes to cook the top until puffy and golden.'
    ],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'recipe_2',
    title: 'Rustic One-Pot Tomato Sauté Pasta',
    prepTime: '20 Mins',
    difficulty: 'Easy',
    tags: ['⏱️ Under 30 Mins', '🌱 Vegan', '🍲 One-Pot'],
    whyReducesWaste: 'Soft tomatoes are actually superior for cooking into quick pasta sauces because they break down instantly. Adding spinach at the end sneaks in nutrients and uses up remaining greens.',
    ingredientsFridge: [
      { name: 'Soft Tomatoes', isExpiring: true, isPresent: false },
      { name: 'Wilting Spinach', isExpiring: true, isPresent: false },
      { name: 'Fresh Garlic', isExpiring: false, isPresent: false }
    ],
    ingredientsPantry: ['Pasta of choice', 'Olive oil', 'Salt', 'Crushed red pepper flakes'],
    steps: [
      'Boil pasta in salted water. Drain, but reserve about 1/2 cup of the starchy pasta cooking water.',
      'In a skillet or pan, heat 2 tablespoons of olive oil over medium-high heat. Add minced garlic and red pepper flakes. Sauté for 1 minute until fragrant.',
      'Add chopped Soft Tomatoes and a pinch of salt. Cook, crushing them slightly with your spatula, for about 6-8 minutes until they collapse into a chunky, glossy sauce.',
      'Add the cooked pasta and the Wilting Spinach. Pour in half of the reserved pasta water. Toss vigorously on high heat for 1 minute until spinach melts and a rich sauce coats the pasta.'
    ],
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'recipe_3',
    title: 'Zero-Waste Golden Banana Pancakes',
    prepTime: '15 Mins',
    difficulty: 'Easy',
    tags: ['⏱️ Under 30 Mins', '🌱 Vegan'],
    whyReducesWaste: 'Browning bananas have maximum natural sugars, which eliminates the need for refined sugar or flour when combined with oats. It is the ultimate pantry rescue!',
    ingredientsFridge: [
      { name: 'Browning Bananas', isExpiring: true, isPresent: false },
      { name: 'Almond Milk', isExpiring: false, isPresent: false }
    ],
    ingredientsPantry: ['Rolled oats', 'Baking powder', 'Cinnamon', 'Salt'],
    steps: [
      'In a blender, grind 1 cup of rolled oats into a fine flour. Add 2 browning bananas, 1/2 cup of almond milk, 1 tsp baking powder, and a generous dash of cinnamon.',
      'Blend on high for 45 seconds until a thick, smooth batter forms. Let the batter rest for 2 minutes to let the oats hydrate.',
      'Heat a non-stick skillet over medium-low heat. Spoon the batter to create small, round circles.',
      'Cook for about 3 minutes until bubbles form and pop on the surface, then carefully flip and cook for 1-2 minutes until beautifully golden-brown. Serve with honey or sliced fruit!'
    ],
    image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'recipe_4',
    title: 'Double-Protein Banana Walnut Yogurt Bowl',
    prepTime: '10 Mins',
    difficulty: 'Easy',
    tags: ['⏱️ Under 30 Mins', '💪 High-Protein'],
    whyReducesWaste: 'Uses both browning bananas and expiring Greek yogurt before the tub goes bad. Toasting walnuts from the pantry adds crucial crunch and rich flavor!',
    ingredientsFridge: [
      { name: 'Browning Bananas', isExpiring: true, isPresent: false },
      { name: 'Greek Yogurt', isExpiring: true, isPresent: false }
    ],
    ingredientsPantry: ['Walnuts', 'Honey or Maple syrup', 'Rolled oats', 'Cinnamon'],
    steps: [
      'Spoon 150g of Greek yogurt into a bowl, making a slight swirl in the center.',
      'Slice up the soft browning bananas and arrange them beautifully around the bowl.',
      'Add a handful of dry rolled oats and crushed walnuts on top for a delightful crunch.',
      'Drizzle with a tablespoon of honey or maple syrup and dust with cinnamon for warmth. Ready to eat in seconds!'
    ],
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'recipe_5',
    title: 'Savory Chicken & Vegetable Sheet-Pan Sauté',
    prepTime: '25 Mins',
    difficulty: 'Easy',
    tags: ['⏱️ Under 30 Mins', '💪 High-Protein', '🍲 One-Pot'],
    whyReducesWaste: 'Rehydrates pre-cooked leftover roasted chicken by pan-frying it with sweet bell peppers and caramelized onions. High heat locks in flavor and minimizes oil waste.',
    ingredientsFridge: [
      { name: 'Roasted Chicken', isExpiring: true, isPresent: false },
      { name: 'Bell Peppers', isExpiring: false, isPresent: false },
      { name: 'Onions', isExpiring: false, isPresent: false }
    ],
    ingredientsPantry: ['Olive oil', 'Soy sauce', 'Garlic powder', 'Dried oregano'],
    steps: [
      'Slice the onions and bell peppers into thin, matchstick-sized pieces. Shred the leftover roasted chicken into bite-sized strips.',
      'Heat 1 tbsp of olive oil in a large skillet on high heat. Add the onions and bell peppers. Sauté for 4-5 minutes until they get charred and tender.',
      'Toss in the shredded roasted chicken, 1 tbsp of soy sauce, 1 tsp garlic powder, oregano, and black pepper. Stir-fry for 3 minutes until chicken is completely warmed through and crispy on the edges.',
      'Serve as a hot bowl, or wrap inside a tortilla if you have one. Simple, incredibly delicious, and full of lean protein.'
    ],
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'recipe_6',
    title: 'French-Style Leftover Chicken Strata',
    prepTime: '40 Mins',
    difficulty: 'Medium',
    tags: ['💪 High-Protein', '🍲 One-Pot'],
    whyReducesWaste: 'The perfect cure for dry, stale bread! By soaking the stale bread cubes in egg and milk, it becomes rich and custard-like. Adding remaining roasted chicken makes it a satisfying complete meal.',
    ingredientsFridge: [
      { name: 'Roasted Chicken', isExpiring: true, isPresent: false },
      { name: 'Stale Bread', isExpiring: true, isPresent: false },
      { name: 'Fresh Eggs', isExpiring: false, isPresent: false },
      { name: 'Cheddar Cheese', isExpiring: false, isPresent: false }
    ],
    ingredientsPantry: ['Milk', 'Butter or oil', 'Salt', 'Black pepper', 'Italian herbs'],
    steps: [
      'Cut stale bread into 1-inch cubes. Chop or shred leftover roasted chicken.',
      'Whisk 4 eggs with 3/4 cup of milk, salt, black pepper, and half of your cheddar cheese.',
      'Grease an oven-safe skillet or small baking dish. Layer the stale bread cubes and chicken. Pour the egg mixture over everything, pressing down so the bread completely soaks up the liquid.',
      'Top with the rest of the cheddar cheese and a pinch of Italian herbs. Bake at 375°F (190°C) for 25-30 minutes until set, puffed, and bubbling golden-brown.'
    ],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'recipe_7',
    title: 'Spanish Stewed Tomatoes & Poached Eggs',
    prepTime: '20 Mins',
    difficulty: 'Easy',
    tags: ['⏱️ Under 30 Mins', '🍲 One-Pot'],
    whyReducesWaste: 'Soft tomatoes release gorgeous juices when cooked down, acting as a perfect poaching liquid for farm eggs. Rescues onions and garlic before they sprout.',
    ingredientsFridge: [
      { name: 'Soft Tomatoes', isExpiring: true, isPresent: false },
      { name: 'Onions', isExpiring: false, isPresent: false },
      { name: 'Fresh Eggs', isExpiring: false, isPresent: false }
    ],
    ingredientsPantry: ['Olive oil', 'Salt', 'Black pepper', 'Paprika', 'Garlic powder'],
    steps: [
      'Chop onions and garlic. Rough chop your Soft Tomatoes (keep all their juices!).',
      'In a skillet, heat 1 tbsp of olive oil. Sauté onions and garlic for 3 minutes. Add chopped tomatoes, a pinch of salt, pepper, and 1 tsp of sweet paprika. Simmer for 8 minutes on medium until you have a thick, fragrant stew.',
      'Use a spoon to create 2 small wells in the tomato mixture. Crack an egg directly into each well.',
      'Cover the pan and cook on low for 5-6 minutes until the egg whites are cooked solid but yolks are still delightfully runny. Scoop out with a spatula and serve!'
    ],
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=600'
  }
];
