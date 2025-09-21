import { test, expect } from '@playwright/test'

test.describe('Food Logs Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Start the dev server before running tests
    // Make sure backend API is running
    await page.goto('http://localhost:3000/(coach)/food-logs')
  })

  test('should load food logs page', async ({ page }) => {
    await expect(page).toHaveTitle(/Food Logs Dashboard/)
    await expect(page.locator('h1')).toContainText('Food Logs Dashboard')
  })

  test('should display filter controls', async ({ page }) => {
    // Check that filter section is visible
    await expect(page.locator('text=Filters')).toBeVisible()
    
    // Check for date input
    await expect(page.locator('input[type="date"]')).toBeVisible()
    
    // Check for meal type selector
    await expect(page.locator('select').first()).toBeVisible()
    
    // Check for apply filters button
    await expect(page.locator('button:has-text("Apply Filters")')).toBeVisible()
  })

  test('should display summary stats cards', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="summary-stats"]', { timeout: 10000 })
    
    // Check summary cards are visible
    await expect(page.locator('text=Total Entries')).toBeVisible()
    await expect(page.locator('text=Total Calories')).toBeVisible()
    await expect(page.locator('text=Avg Inflammation Score')).toBeVisible()
    await expect(page.locator('text=Meal Breakdown')).toBeVisible()
  })

  test('should display food entries table', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 })
    
    // Check table headers
    await expect(page.locator('th:has-text("Time / Food")')).toBeVisible()
    await expect(page.locator('th:has-text("Quantity")')).toBeVisible()
    await expect(page.locator('th:has-text("Meal")')).toBeVisible()
    await expect(page.locator('th:has-text("Calories")')).toBeVisible()
    await expect(page.locator('th:has-text("Macros")')).toBeVisible()
    await expect(page.locator('th:has-text("Inflammation")')).toBeVisible()
  })

  test('should be able to filter by meal type', async ({ page }) => {
    // Select breakfast from meal type filter
    await page.locator('select#mealType').selectOption('breakfast')
    
    // Click apply filters
    await page.locator('button:has-text("Apply Filters")').click()
    
    // Wait for the filter to be applied (loading state)
    await page.waitForTimeout(1000)
    
    // Verify URL or some indication that filter was applied
    await expect(page.url()).toContain('mealType=breakfast')
  })

  test('should be able to export CSV', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('button:has-text("Export CSV")', { timeout: 10000 })
    
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download')
    
    // Click export button
    await page.locator('button:has-text("Export CSV")').click()
    
    // Wait for download to complete
    const download = await downloadPromise
    
    // Verify download file name contains expected pattern
    expect(download.suggestedFilename()).toMatch(/food-logs.*\.csv/)
  })

  test('should handle empty state', async ({ page }) => {
    // Navigate to a date with no data (future date)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const futureDateString = futureDate.toISOString().split('T')[0]
    
    await page.locator('input[type="date"]').fill(futureDateString)
    await page.locator('button:has-text("Apply Filters")').click()
    
    // Should show empty state message
    await expect(page.locator('text=No food entries found')).toBeVisible()
  })

  test('should handle loading state', async ({ page }) => {
    // Click apply filters to trigger loading
    await page.locator('button:has-text("Apply Filters")').click()
    
    // Should show loading text briefly
    await expect(page.locator('button:has-text("Loading...")')).toBeVisible()
  })
})

test.describe('Trends Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/(coach)/food-logs/trends')
  })

  test('should load trends page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Inflammation Trends')
    await expect(page.locator('text=Track inflammation scores and patterns over time')).toBeVisible()
  })

  test('should display filter controls', async ({ page }) => {
    await expect(page.locator('text=Filters')).toBeVisible()
    await expect(page.locator('input[placeholder*="Filter by specific user"]')).toBeVisible()
    await expect(page.locator('select')).toBeVisible()
    await expect(page.locator('button:has-text("Update Charts")')).toBeVisible()
  })

  test('should display summary cards', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000)
    
    await expect(page.locator('text=Avg Inflammation Score')).toBeVisible()
    await expect(page.locator('text=Avg Daily Calories')).toBeVisible()
    await expect(page.locator('text=Total Food Entries')).toBeVisible()
  })

  test('should display charts', async ({ page }) => {
    // Wait for charts to load
    await page.waitForTimeout(3000)
    
    await expect(page.locator('text=Inflammation Score Over Time')).toBeVisible()
    await expect(page.locator('text=Daily Calorie Intake')).toBeVisible()
    await expect(page.locator('text=Daily Food Entry Count')).toBeVisible()
  })

  test('should be able to change date range', async ({ page }) => {
    // Select different date range
    await page.locator('select#dateRange').selectOption('14')
    
    // Click update charts
    await page.locator('button:has-text("Update Charts")').click()
    
    // Should show loading state
    await expect(page.locator('button:has-text("Loading...")')).toBeVisible()
  })
})

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and return errors
    await page.route('**/api/food/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: { message: 'Server Error' } })
      })
    })

    await page.goto('http://localhost:3000/(coach)/food-logs')
    
    // Should show error state
    await expect(page.locator('text=Failed to fetch')).toBeVisible()
  })

  test('should handle slow API responses', async ({ page }) => {
    // Slow down API responses
    await page.route('**/api/food/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.continue()
    })

    await page.goto('http://localhost:3000/(coach)/food-logs')
    
    // Should show loading state
    await expect(page.locator('text=Loading food entries...')).toBeVisible()
  })
})