import { z } from 'zod'

// Validation schemas
export const MealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
export const UnitSchema = z.enum(['g', 'ml', 'cup', 'piece', 'oz', 'tbsp', 'tsp'])

export const CreateFoodEntrySchema = z.object({
  name: z.string().min(1, 'Food name is required'),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: UnitSchema,
  mealType: MealTypeSchema,
  consumedAt: z.date().optional(),
  
  // Macro nutrients per 100g/100ml
  caloriesPer100: z.number().min(0, 'Calories must be non-negative'),
  proteinPer100: z.number().min(0, 'Protein must be non-negative'),
  fatPer100: z.number().min(0, 'Fat must be non-negative'),
  carbsPer100: z.number().min(0, 'Carbs must be non-negative'),
  fiberPer100: z.number().min(0, 'Fiber must be non-negative').optional(),
  sugarPer100: z.number().min(0, 'Sugar must be non-negative').optional(),
  sodiumPer100: z.number().min(0, 'Sodium must be non-negative').optional(),
})

export const UpdateFoodEntrySchema = CreateFoodEntrySchema.partial()

export const GetFoodEntriesSchema = z.object({
  userId: z.string().optional(),
  date: z.string().optional(), // ISO date string
  mealType: MealTypeSchema.optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export const DateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
})

// Types
export type MealType = z.infer<typeof MealTypeSchema>
export type Unit = z.infer<typeof UnitSchema>
export type CreateFoodEntry = z.infer<typeof CreateFoodEntrySchema>
export type UpdateFoodEntry = z.infer<typeof UpdateFoodEntrySchema>
export type GetFoodEntriesQuery = z.infer<typeof GetFoodEntriesSchema>
export type DateRange = z.infer<typeof DateRangeSchema>

// Calculated nutrition values
export interface NutritionTotals {
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  totalFiber: number
  totalSugar: number
  totalSodium: number
}

// Inflammation scoring
export interface InflammationMetrics {
  dailyScore: number // 0-100, lower is better
  foodCount: number
  mealScores: {
    breakfast?: number
    lunch?: number
    dinner?: number
    snack?: number
  }
}

// Fitness integration
export interface FitnessMetrics {
  steps?: number
  caloriesBurned?: number
  activeMinutes?: number
  source?: string
}

// API Response types
export interface FoodEntryResponse {
  id: string
  name: string
  brand?: string
  barcode?: string
  quantity: number
  unit: string
  mealType: string
  consumedAt: Date
  
  // Per 100g/ml values
  caloriesPer100: number
  proteinPer100: number
  fatPer100: number
  carbsPer100: number
  fiberPer100?: number
  sugarPer100?: number
  sodiumPer100?: number
  
  // Calculated totals
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  totalFiber?: number
  totalSugar?: number
  totalSodium?: number
  
  inflammationScore?: number
  createdAt: Date
  updatedAt: Date
}

export interface DayViewResponse {
  date: string
  foodEntries: FoodEntryResponse[]
  macroTotals: NutritionTotals & {
    breakfastCalories: number
    lunchCalories: number
    dinnerCalories: number
    snackCalories: number
  }
  inflammationMetrics: InflammationMetrics
  fitnessMetrics?: FitnessMetrics
}

export interface WeekViewResponse {
  startDate: string
  endDate: string
  days: DayViewResponse[]
  weeklyAverages: {
    avgCalories: number
    avgInflammationScore: number
    avgSteps?: number
  }
}

// Error types
export interface ApiError {
  message: string
  code?: string
  field?: string
}

export interface ValidationError extends ApiError {
  field: string
  code: 'VALIDATION_ERROR'
}

// Inflammation scoring function interface
export interface InflammationScoringInput {
  name: string
  brand?: string
  totalCalories: number
  totalProtein: number
  totalFat: number
  totalCarbs: number
  totalFiber?: number
  totalSugar?: number
  totalSodium?: number
}

// Helper function to calculate nutrition totals
export function calculateNutritionTotals(
  quantity: number,
  per100: {
    caloriesPer100: number
    proteinPer100: number
    fatPer100: number
    carbsPer100: number
    fiberPer100?: number
    sugarPer100?: number
    sodiumPer100?: number
  }
): NutritionTotals {
  const ratio = quantity / 100
  
  return {
    totalCalories: per100.caloriesPer100 * ratio,
    totalProtein: per100.proteinPer100 * ratio,
    totalFat: per100.fatPer100 * ratio,
    totalCarbs: per100.carbsPer100 * ratio,
    totalFiber: per100.fiberPer100 ? per100.fiberPer100 * ratio : 0,
    totalSugar: per100.sugarPer100 ? per100.sugarPer100 * ratio : 0,
    totalSodium: per100.sodiumPer100 ? per100.sodiumPer100 * ratio : 0,
  }
}

// Simple inflammation scoring function (to be replaced with ML model)
export function calculateInflammationScore(input: InflammationScoringInput): number {
  let score = 50 // neutral baseline
  
  // Anti-inflammatory foods (lower scores)
  const antiInflammatoryKeywords = [
    'blueberr', 'salmon', 'sardine', 'mackerel', 'walnut', 'almond',
    'spinach', 'kale', 'broccoli', 'sweet potato', 'turmeric', 'ginger',
    'olive oil', 'avocado', 'green tea', 'dark chocolate', 'tart cherry'
  ]
  
  // Pro-inflammatory foods (higher scores)
  const proInflammatoryKeywords = [
    'fried', 'processed', 'refined', 'sugar', 'soda', 'white bread',
    'donut', 'cookie', 'cake', 'pizza', 'burger', 'fries', 'candy'
  ]
  
  const foodName = input.name.toLowerCase()
  const brand = input.brand?.toLowerCase() || ''
  const searchText = foodName + ' ' + brand
  
  // Check for anti-inflammatory keywords
  let antiInflammatoryCount = 0
  antiInflammatoryKeywords.forEach(keyword => {
    if (searchText.includes(keyword)) {
      antiInflammatoryCount++
    }
  })
  
  // Check for pro-inflammatory keywords
  let proInflammatoryCount = 0
  proInflammatoryKeywords.forEach(keyword => {
    if (searchText.includes(keyword)) {
      proInflammatoryCount++
    }
  })
  
  // Adjust score based on keywords
  score -= antiInflammatoryCount * 15 // Reduce score for anti-inflammatory foods
  score += proInflammatoryCount * 20  // Increase score for pro-inflammatory foods
  
  // Nutrition-based adjustments
  if (input.totalFiber && input.totalFiber > 5) score -= 5 // High fiber is good
  if (input.totalSugar && input.totalSugar > 20) score += 10 // High sugar is bad
  if (input.totalSodium && input.totalSodium > 500) score += 8 // High sodium is bad
  
  // Fat quality heuristics (simplified)
  const fatRatio = input.totalFat / input.totalCalories
  if (fatRatio > 0.35) score += 5 // Very high fat ratio
  if (fatRatio < 0.1 && input.totalCarbs > 50) score += 5 // High carb, low fat (processed carbs)
  
  // Protein quality bonus
  if (input.totalProtein > 20) score -= 3
  
  // Ensure score stays within bounds
  return Math.max(0, Math.min(100, Math.round(score)))
}