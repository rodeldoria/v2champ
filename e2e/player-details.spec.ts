import { test, expect } from '@playwright/test';

test('player details page shows correct sections', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.fill('[data-testid="username-input"]', 'testuser');
  await page.click('[data-testid="login-button"]');
  
  // Navigate to player details
  await page.goto('/players/123');
  
  // Check for main sections
  await expect(page.getByTestId('player-header')).toBeVisible();
  await expect(page.getByTestId('offense-section')).toBeVisible();
  await expect(page.getByTestId('defense-section')).toBeVisible();
  
  // Check for overall rating
  const overallRating = page.getByTestId('overall-rating');
  await expect(overallRating).toBeVisible();
  const ratingText = await overallRating.textContent();
  expect(parseInt(ratingText || '0')).toBeGreaterThan(0);
  expect(parseInt(ratingText || '0')).toBeLessThanOrEqual(99);
  
  // Take screenshot on failure
  await page.screenshot({ path: 'player-details-test.png' });
});