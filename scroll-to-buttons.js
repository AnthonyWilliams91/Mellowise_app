const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/landing');
  
  // Wait for page to load
  await page.waitForTimeout(1000);
  
  // Scroll to the buttons section
  await page.evaluate(() => {
    const buttons = document.querySelector('button');
    if (buttons) {
      buttons.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  
  await page.waitForTimeout(500);
  
  // Take screenshot focused on the buttons area
  const buttonsSection = await page.locator('button').first();
  await buttonsSection.screenshot({ path: 'buttons-close-up.png' });
  
  await browser.close();
})();
