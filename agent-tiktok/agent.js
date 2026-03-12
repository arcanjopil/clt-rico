require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const { createVideo } = require('./video_generator');

const COOKIES_PATH = path.join(__dirname, 'tiktok_cookies.json');

async function loadProducts() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    console.error('Products file not found!');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
}

async function selectProduct(products) {
  const product = products[Math.floor(Math.random() * products.length)];
  console.log(`Selected Product: ${product.name}`);
  return product;
}

async function generateVideo(product) {
  console.log(`Generating video for ${product.name}...`);
  try {
    const videoPath = await createVideo(product);
    return videoPath;
  } catch (error) {
    console.error('Failed to generate video:', error);
    return null;
  }
}

async function saveCookies(context) {
  const cookies = await context.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  console.log('Session cookies saved.');
}

async function loadCookies(context) {
  if (fs.existsSync(COOKIES_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf8'));
    await context.addCookies(cookies);
    console.log('Session cookies loaded.');
    return true;
  }
  return false;
}

async function login(page) {
  console.log('Navigating to TikTok login...');
  await page.goto('https://www.tiktok.com/login', { waitUntil: 'networkidle' });

  // Check if already logged in via cookies
  if (await page.getByTestId('header-login-button').isHidden()) {
    console.log('Already logged in!');
    return;
  }

  console.log('Please log in manually in the browser window if automated login fails.');
  
  // Attempt automated login if credentials provided
  const email = process.env.TIKTOK_EMAIL;
  const password = process.env.TIKTOK_PASSWORD;

  if (email && password) {
    try {
      console.log('Attempting automated login...');
      // Note: Selectors might change. This is a best-effort attempt.
      // Click "Use phone / email / username"
      await page.click('text="Use phone / email / username"');
      await page.waitForTimeout(2000);
      
      // Click "Log in with email or username"
      await page.click('a[href*="email"]'); 
      
      await page.fill('input[name="username"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation or captcha
      await page.waitForNavigation({ timeout: 60000 }); 
    } catch (e) {
      console.log('Automated login failed or required CAPTCHA. Please complete login manually.');
    }
  }

  // Wait for user to complete login manually if needed
  console.log('Waiting for login to complete...');
  await page.waitForURL('https://www.tiktok.com/foryou', { timeout: 300000 }); // 5 min timeout
  console.log('Login successful!');
}

async function uploadVideo(page, videoPath, product) {
  console.log('Navigating to upload page...');
  await page.goto('https://www.tiktok.com/upload', { waitUntil: 'networkidle' });

  console.log('Uploading video...');
  
  // Handle file upload
  const fileInput = await page.waitForSelector('input[type="file"]');
  await fileInput.setInputFiles(videoPath);

  // Wait for upload to process
  console.log('Waiting for video to process...');
  await page.waitForSelector('.uploaded-video-player', { timeout: 60000 });

  // Set caption
  const caption = `${product.name} - ${product.description} \n\n${product.hashtags.join(' ')}`;
  console.log(`Setting caption: ${caption}`);
  
  // Note: Caption input selector is tricky and changes often. 
  // We might need to click the editor and type.
  await page.click('.public-DraftEditor-content');
  await page.keyboard.type(caption);

  // Post
  console.log('Posting video...');
  const postButton = await page.waitForSelector('button:has-text("Post")');
  // await postButton.click(); // Uncomment to actually post
  console.log('Ready to post! (Click "Post" manually to confirm for safety)');
  
  // Keep browser open for a bit
  await page.waitForTimeout(10000);
}

(async () => {
  const browser = await chromium.launch({ headless: false }); // Headful for debugging/CAPTCHA
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const products = await loadProducts();
    const product = await selectProduct(products);
    const videoPath = await generateVideo(product);

    if (!videoPath) {
      console.log('Skipping upload due to missing video.');
      await browser.close();
      return;
    }

    await loadCookies(context);
    await login(page);
    await saveCookies(context); // Save for next time

    await uploadVideo(page, videoPath, product);

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // await browser.close(); // Keep open for inspection
  }
})();
