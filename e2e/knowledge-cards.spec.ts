import { test, expect } from '@playwright/test';

test.describe('Knowledge Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cards');
  });

  test('displays cards list page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Knowledge Cards');
  });

  test('filters cards by type', async ({ page }) => {
    const theoryCheckbox = page.locator('label:has-text("Theory") input[type="checkbox"]');
    await theoryCheckbox.check();
    
    await expect(page.locator('.knowledge-card')).toHaveCount(0, { timeout: 3000 });
  });

  test('searches for cards', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search cards..."]');
    await searchInput.fill('test query');
    
    await page.waitForTimeout(500);
  });

  test('toggles between grid and list layout', async ({ page }) => {
    const listButton = page.locator('.layout-btn').nth(1);
    await listButton.click();
    
    await expect(page.locator('.card-grid.layout-list')).toBeVisible();
    
    const gridButton = page.locator('.layout-btn').first();
    await gridButton.click();
    
    await expect(page.locator('.card-grid.layout-grid')).toBeVisible();
  });

  test('persists filters in query params', async ({ page }) => {
    const theoryCheckbox = page.locator('label:has-text("Theory") input[type="checkbox"]');
    await theoryCheckbox.check();
    
    await page.waitForTimeout(300);
    
    const url = new URL(page.url());
    expect(url.searchParams.get('types')).toContain('Theory');
  });

  test('shows QR code when button is clicked', async ({ page }) => {
    await page.route('**/api/knowledge-cards*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [{
            id: '1',
            title: 'Test Card',
            type: 'Theory',
            description: 'Test description',
            tags: ['test'],
            difficulty: 'Beginner',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          }],
          meta: {
            pagination: {
              page: 1,
              pageSize: 12,
              pageCount: 1,
              total: 1,
            },
          },
        }),
      });
    });

    await page.reload();
    
    const qrButton = page.locator('button:has-text("QR Code")').first();
    await qrButton.click();
    
    await expect(page.locator('.qr-container')).toBeVisible();
  });

  test('mobile filter toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const toggleButton = page.locator('.mobile-toggle');
    await toggleButton.click();
    
    await expect(page.locator('.filter-content.expanded')).toBeVisible();
  });
});

test.describe('Card Detail Page', () => {
  test('navigates to card detail', async ({ page }) => {
    await page.route('**/api/knowledge-cards*', route => {
      const url = new URL(route.request().url());
      
      if (url.pathname.includes('/1')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: {
              id: '1',
              title: 'Test Card Detail',
              type: 'Theory',
              description: 'Detailed description',
              tags: ['test'],
              difficulty: 'Beginner',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: [{
              id: '1',
              title: 'Test Card',
              type: 'Theory',
              description: 'Test description',
              tags: ['test'],
              difficulty: 'Beginner',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            }],
            meta: {
              pagination: {
                page: 1,
                pageSize: 12,
                pageCount: 1,
                total: 1,
              },
            },
          }),
        });
      }
    });

    await page.goto('/cards');
    
    const cardLink = page.locator('.card-link').first();
    await cardLink.click();
    
    await expect(page).toHaveURL(/\/cards\/1/);
  });

  test('displays QR code on detail page', async ({ page }) => {
    await page.route('**/api/knowledge-cards/1*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            id: '1',
            title: 'Test Card',
            type: 'Theory',
            description: 'Test description',
            tags: ['test'],
            difficulty: 'Beginner',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        }),
      });
    });

    await page.goto('/cards/1');
    
    await expect(page.locator('.qr-section')).toBeVisible();
    await expect(page.locator('.qr-code')).toBeVisible();
  });

  test('copies AI prompt on detail page', async ({ page }) => {
    await page.route('**/api/knowledge-cards/1*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            id: '1',
            title: 'AI Prompt Card',
            type: 'AI Prompt',
            description: 'Test description',
            tags: ['test'],
            difficulty: 'Beginner',
            aiPrompt: 'This is a test AI prompt',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        }),
      });
    });

    await page.goto('/cards/1');
    
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const copyButton = page.locator('button:has-text("Copy Prompt")');
    await copyButton.click();
    
    await expect(page.locator('button:has-text("Copied!")')).toBeVisible();
  });
});
