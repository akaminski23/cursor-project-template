import { describe, it, expect, beforeEach } from 'vitest'
import { calculateInflammationScore, calculateNutritionTotals } from '@ai-2dor/core'

describe('Food Tracking API Tests', () => {
  describe('calculateNutritionTotals', () => {
    it('should calculate nutrition totals correctly', () => {
      const quantity = 150 // 150g
      const per100 = {
        caloriesPer100: 200,
        proteinPer100: 25,
        fatPer100: 10,
        carbsPer100: 5,
        fiberPer100: 3,
        sugarPer100: 2,
        sodiumPer100: 100,
      }

      const result = calculateNutritionTotals(quantity, per100)

      expect(result.totalCalories).toBe(300) // 200 * 1.5
      expect(result.totalProtein).toBe(37.5) // 25 * 1.5
      expect(result.totalFat).toBe(15) // 10 * 1.5
      expect(result.totalCarbs).toBe(7.5) // 5 * 1.5
      expect(result.totalFiber).toBe(4.5) // 3 * 1.5
      expect(result.totalSugar).toBe(3) // 2 * 1.5
      expect(result.totalSodium).toBe(150) // 100 * 1.5
    })

    it('should handle optional nutrition values', () => {
      const quantity = 100
      const per100 = {
        caloriesPer100: 100,
        proteinPer100: 10,
        fatPer100: 5,
        carbsPer100: 15,
      }

      const result = calculateNutritionTotals(quantity, per100)

      expect(result.totalCalories).toBe(100)
      expect(result.totalProtein).toBe(10)
      expect(result.totalFat).toBe(5)
      expect(result.totalCarbs).toBe(15)
      expect(result.totalFiber).toBe(0)
      expect(result.totalSugar).toBe(0)
      expect(result.totalSodium).toBe(0)
    })
  })

  describe('calculateInflammationScore', () => {
    it('should give low scores for anti-inflammatory foods', () => {
      const blueberries = {
        name: 'Blueberries',
        brand: undefined,
        totalCalories: 57,
        totalProtein: 0.7,
        totalFat: 0.3,
        totalCarbs: 14.5,
        totalFiber: 2.4,
        totalSugar: 10.0,
        totalSodium: 1,
      }

      const score = calculateInflammationScore(blueberries)
      expect(score).toBeLessThan(30) // Should be in "good" range
    })

    it('should give high scores for pro-inflammatory foods', () => {
      const friedFood = {
        name: 'Fried Chicken',
        brand: 'Fast Food Chain',
        totalCalories: 400,
        totalProtein: 25,
        totalFat: 25,
        totalCarbs: 15,
        totalFiber: 0,
        totalSugar: 2,
        totalSodium: 800,
      }

      const score = calculateInflammationScore(friedFood)
      expect(score).toBeGreaterThan(60) // Should be in "high" range
    })

    it('should give moderate scores for neutral foods', () => {
      const chickenBreast = {
        name: 'Chicken Breast',
        brand: undefined,
        totalCalories: 165,
        totalProtein: 31,
        totalFat: 3.6,
        totalCarbs: 0,
        totalFiber: 0,
        totalSugar: 0,
        totalSodium: 74,
      }

      const score = calculateInflammationScore(chickenBreast)
      expect(score).toBeGreaterThan(30)
      expect(score).toBeLessThan(60) // Should be in "moderate" range
    })

    it('should penalize high sugar content', () => {
      const lowSugar = {
        name: 'Plain Oatmeal',
        totalCalories: 150,
        totalProtein: 5,
        totalFat: 3,
        totalCarbs: 30,
        totalFiber: 4,
        totalSugar: 1,
        totalSodium: 5,
      }

      const highSugar = {
        name: 'Sugary Cereal',
        totalCalories: 150,
        totalProtein: 5,
        totalFat: 3,
        totalCarbs: 30,
        totalFiber: 1,
        totalSugar: 25,
        totalSodium: 200,
      }

      const lowScore = calculateInflammationScore(lowSugar)
      const highScore = calculateInflammationScore(highSugar)

      expect(highScore).toBeGreaterThan(lowScore)
    })

    it('should reward high fiber content', () => {
      const lowFiber = {
        name: 'White Bread',
        totalCalories: 265,
        totalProtein: 9,
        totalFat: 3,
        totalCarbs: 49,
        totalFiber: 2,
        totalSugar: 6,
        totalSodium: 477,
      }

      const highFiber = {
        name: 'Whole Grain Bread',
        totalCalories: 265,
        totalProtein: 9,
        totalFat: 3,
        totalCarbs: 49,
        totalFiber: 8,
        totalSugar: 6,
        totalSodium: 400,
      }

      const lowFiberScore = calculateInflammationScore(lowFiber)
      const highFiberScore = calculateInflammationScore(highFiber)

      expect(highFiberScore).toBeLessThan(lowFiberScore)
    })

    it('should return scores within valid range', () => {
      const testCases = [
        { name: 'Extreme Low', totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0 },
        { name: 'Extreme High', totalCalories: 1000, totalProtein: 100, totalFat: 100, totalCarbs: 100, totalSugar: 100, totalSodium: 5000 },
        { name: 'Salmon', totalCalories: 208, totalProtein: 25.4, totalFat: 12.4, totalCarbs: 0 },
      ]

      testCases.forEach(testCase => {
        const score = calculateInflammationScore(testCase)
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
        expect(Number.isInteger(score)).toBe(true) // Should be rounded
      })
    })
  })

  describe('Scoring edge cases', () => {
    it('should handle zero values gracefully', () => {
      const zeroFood = {
        name: 'Zero Food',
        totalCalories: 0,
        totalProtein: 0,
        totalFat: 0,
        totalCarbs: 0,
      }

      const score = calculateInflammationScore(zeroFood)
      expect(score).toBe(50) // Should return neutral baseline
    })

    it('should handle missing optional properties', () => {
      const minimalFood = {
        name: 'Minimal Food',
        totalCalories: 100,
        totalProtein: 10,
        totalFat: 5,
        totalCarbs: 15,
      }

      const score = calculateInflammationScore(minimalFood)
      expect(typeof score).toBe('number')
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })
})