import { test, expect } from "@playwright/test"

test.describe("Email Analysis Flow", () => {
  test("should analyze email and generate response", async ({ page }) => {
    // Login
    await page.goto("/login")
    await page.fill('[data-testid="email-input"]', "admin@inboxpilot.com")
    await page.fill('[data-testid="password-input"]', "password123")
    await page.click('[data-testid="login-button"]')

    // Navigate to emails
    await page.goto("/emails")
    await expect(page).toHaveURL("/emails")

    // Click on first email
    await page.click('[data-testid="email-item"]:first-child')

    // Wait for AI analysis
    await page.waitForSelector('[data-testid="ai-analysis"]')

    // Check if analysis is displayed
    await expect(page.locator('[data-testid="email-category"]')).toBeVisible()
    await expect(page.locator('[data-testid="suggested-response"]')).toBeVisible()

    // Test response generation
    await page.click('[data-testid="generate-response-button"]')
    await page.waitForSelector('[data-testid="generated-response"]')

    const responseText = await page.locator('[data-testid="generated-response"]').textContent()
    expect(responseText).toBeTruthy()
    expect(responseText!.length).toBeGreaterThan(10)
  })

  test("should handle AI service errors gracefully", async ({ page }) => {
    // Mock API to return error
    await page.route("/api/email-analysis", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "AI service unavailable" }),
      })
    })

    await page.goto("/emails/1")

    // Should show error message
    await expect(page.locator('[data-testid="ai-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="ai-error"]')).toContainText("AI service unavailable")
  })
})
