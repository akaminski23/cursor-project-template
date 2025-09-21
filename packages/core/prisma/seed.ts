import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'coach@kaminskiperformance.com' },
    update: {},
    create: {
      email: 'coach@kaminskiperformance.com',
      name: 'Performance Coach',
    },
  })

  // Sample food entries for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sampleFoods = [
    {
      name: 'Oatmeal',
      brand: 'Quaker',
      quantity: 50, // 50g
      unit: 'g',
      mealType: 'breakfast',
      caloriesPer100: 389,
      proteinPer100: 16.9,
      fatPer100: 6.9,
      carbsPer100: 66.3,
      fiberPer100: 10.6,
      sugarPer100: 1.1,
      sodiumPer100: 2,
    },
    {
      name: 'Blueberries',
      brand: null,
      quantity: 100, // 100g
      unit: 'g',
      mealType: 'breakfast',
      caloriesPer100: 57,
      proteinPer100: 0.7,
      fatPer100: 0.3,
      carbsPer100: 14.5,
      fiberPer100: 2.4,
      sugarPer100: 10.0,
      sodiumPer100: 1,
    },
    {
      name: 'Grilled Chicken Breast',
      brand: null,
      quantity: 150, // 150g
      unit: 'g',
      mealType: 'lunch',
      caloriesPer100: 165,
      proteinPer100: 31.0,
      fatPer100: 3.6,
      carbsPer100: 0,
      fiberPer100: 0,
      sugarPer100: 0,
      sodiumPer100: 74,
    },
    {
      name: 'Sweet Potato',
      brand: null,
      quantity: 200, // 200g
      unit: 'g',
      mealType: 'lunch',
      caloriesPer100: 86,
      proteinPer100: 1.6,
      fatPer100: 0.1,
      carbsPer100: 20.1,
      fiberPer100: 3.0,
      sugarPer100: 4.2,
      sodiumPer100: 54,
    },
    {
      name: 'Salmon Fillet',
      brand: null,
      quantity: 120, // 120g
      unit: 'g',
      mealType: 'dinner',
      caloriesPer100: 208,
      proteinPer100: 25.4,
      fatPer100: 12.4,
      carbsPer100: 0,
      fiberPer100: 0,
      sugarPer100: 0,
      sodiumPer100: 59,
    },
    {
      name: 'Mixed Nuts',
      brand: 'Planters',
      quantity: 30, // 30g
      unit: 'g',
      mealType: 'snack',
      caloriesPer100: 607,
      proteinPer100: 20.0,
      fatPer100: 54.0,
      carbsPer100: 13.0,
      fiberPer100: 8.0,
      sugarPer100: 4.0,
      sodiumPer100: 16,
    },
  ]

  // Calculate totals and inflammation scores for each food entry
  const foodEntries = sampleFoods.map((food) => {
    const ratio = food.quantity / 100
    
    // Calculate totals
    const totalCalories = food.caloriesPer100 * ratio
    const totalProtein = food.proteinPer100 * ratio
    const totalFat = food.fatPer100 * ratio
    const totalCarbs = food.carbsPer100 * ratio
    const totalFiber = food.fiberPer100 ? food.fiberPer100 * ratio : null
    const totalSugar = food.sugarPer100 ? food.sugarPer100 * ratio : null
    const totalSodium = food.sodiumPer100 ? food.sodiumPer100 * ratio : null

    // Simple inflammation scoring (0-100, lower is better)
    // This is a placeholder - will be replaced with proper ML model
    let inflammationScore = 50 // neutral baseline
    
    // Anti-inflammatory foods (lower scores)
    if (food.name.includes('Blueberries')) inflammationScore = 15
    if (food.name.includes('Salmon')) inflammationScore = 20
    if (food.name.includes('Sweet Potato')) inflammationScore = 25
    if (food.name.includes('Oatmeal')) inflammationScore = 30
    
    // Pro-inflammatory foods (higher scores)
    if (food.name.includes('Mixed Nuts')) inflammationScore = 35 // nuts are generally good
    if (food.name.includes('Chicken')) inflammationScore = 40

    return {
      ...food,
      userId: user1.id,
      consumedAt: new Date(today.getTime() + Math.random() * 86400000), // Random time today
      totalCalories,
      totalProtein,
      totalFat,
      totalCarbs,
      totalFiber,
      totalSugar,
      totalSodium,
      inflammationScore,
    }
  })

  // Insert food entries
  for (const entry of foodEntries) {
    await prisma.foodEntry.create({
      data: entry,
    })
  }

  // Calculate and create macro totals for the day
  const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.totalCalories, 0)
  const totalProtein = foodEntries.reduce((sum, entry) => sum + entry.totalProtein, 0)
  const totalFat = foodEntries.reduce((sum, entry) => sum + entry.totalFat, 0)
  const totalCarbs = foodEntries.reduce((sum, entry) => sum + entry.totalCarbs, 0)
  const totalFiber = foodEntries.reduce((sum, entry) => sum + (entry.totalFiber || 0), 0)
  const totalSugar = foodEntries.reduce((sum, entry) => sum + (entry.totalSugar || 0), 0)
  const totalSodium = foodEntries.reduce((sum, entry) => sum + (entry.totalSodium || 0), 0)

  // Calculate calories by meal type
  const breakfastCalories = foodEntries
    .filter(entry => entry.mealType === 'breakfast')
    .reduce((sum, entry) => sum + entry.totalCalories, 0)
  const lunchCalories = foodEntries
    .filter(entry => entry.mealType === 'lunch')
    .reduce((sum, entry) => sum + entry.totalCalories, 0)
  const dinnerCalories = foodEntries
    .filter(entry => entry.mealType === 'dinner')
    .reduce((sum, entry) => sum + entry.totalCalories, 0)
  const snackCalories = foodEntries
    .filter(entry => entry.mealType === 'snack')
    .reduce((sum, entry) => sum + entry.totalCalories, 0)

  await prisma.macroTotals.create({
    data: {
      userId: user1.id,
      date: today,
      totalCalories,
      totalProtein,
      totalFat,
      totalCarbs,
      totalFiber,
      totalSugar,
      totalSodium,
      breakfastCalories,
      lunchCalories,
      dinnerCalories,
      snackCalories,
    },
  })

  // Calculate inflammation score for the day
  const avgInflammationScore = foodEntries.reduce((sum, entry) => sum + entry.inflammationScore, 0) / foodEntries.length
  
  await prisma.inflammationScore.create({
    data: {
      userId: user1.id,
      date: today,
      dailyScore: avgInflammationScore,
      foodCount: foodEntries.length,
      breakfastScore: foodEntries
        .filter(entry => entry.mealType === 'breakfast')
        .reduce((sum, entry) => sum + entry.inflammationScore, 0) / foodEntries.filter(entry => entry.mealType === 'breakfast').length,
      lunchScore: foodEntries
        .filter(entry => entry.mealType === 'lunch')
        .reduce((sum, entry) => sum + entry.inflammationScore, 0) / foodEntries.filter(entry => entry.mealType === 'lunch').length,
      dinnerScore: foodEntries
        .filter(entry => entry.mealType === 'dinner')
        .reduce((sum, entry) => sum + entry.inflammationScore, 0) / foodEntries.filter(entry => entry.mealType === 'dinner').length,
      snackScore: foodEntries
        .filter(entry => entry.mealType === 'snack')
        .reduce((sum, entry) => sum + entry.inflammationScore, 0) / foodEntries.filter(entry => entry.mealType === 'snack').length,
    },
  })

  // Sample fitness data
  await prisma.fitnessData.create({
    data: {
      userId: user1.id,
      date: today,
      steps: 8500,
      caloriesBurned: 2200,
      activeMinutes: 45,
      source: 'apple_health',
    },
  })

  console.log({ user1, user2 })
  console.log(`Created ${foodEntries.length} food entries for ${user1.name}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })