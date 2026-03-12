const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

const ASSETS_DIR = __dirname;
const FONT_PATH = path.join(ASSETS_DIR, 'font.ttf');
const BG_PATH = path.join(ASSETS_DIR, 'background.jpg');
const OUTPUT_PATH = path.join(ASSETS_DIR, 'output.mp4');

/**
 * Generates a simple sales video for a product.
 * @param {object} product - Product object { name, price, description }
 * @returns {Promise<string>} - Path to the generated video file
 */
async function createVideo(product) {
  return new Promise((resolve, reject) => {
    console.log(`Creating video for: ${product.name}`);

    // Escape text for ffmpeg drawtext
    const sanitize = (str) => str.replace(/:/g, '\\:').replace(/'/g, '');
    
    const titleText = sanitize(product.name);
    const priceText = sanitize(product.price);
    
    // Command to create video
    // 1. Loop image for 10 seconds
    // 2. Scale to 720x1280 (vertical video)
    // 3. Draw Product Name (Centered, Top)
    // 4. Draw Price (Centered, Middle)
    // 5. Add simple fade in/out (optional, keeping it simple for now)
    
    ffmpeg()
      .input(BG_PATH)
      .inputOptions(['-loop 1']) // Loop the image
      .videoFilters([
        {
          filter: 'scale',
          options: '720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2'
        },
        {
          filter: 'drawtext',
          options: {
            fontfile: FONT_PATH,
            text: titleText,
            fontsize: 64,
            fontcolor: 'white',
            x: '(w-text_w)/2',
            y: 'h/3',
            shadowcolor: 'black',
            shadowx: 2,
            shadowy: 2
          }
        },
        {
          filter: 'drawtext',
          options: {
            fontfile: FONT_PATH,
            text: priceText,
            fontsize: 96,
            fontcolor: 'yellow',
            x: '(w-text_w)/2',
            y: '(h-text_h)/2',
            shadowcolor: 'black',
            shadowx: 4,
            shadowy: 4
          }
        },
        {
            filter: 'drawtext',
            options: {
              fontfile: FONT_PATH,
              text: 'Link na Bio!',
              fontsize: 48,
              fontcolor: 'white',
              x: '(w-text_w)/2',
              y: 'h*0.8',
              shadowcolor: 'black',
              shadowx: 2,
              shadowy: 2
            }
          }
      ])
      .outputOptions([
        '-t 10',          // Duration 10s
        '-c:v libx264',   // Codec
        '-pix_fmt yuv420p', // Pixel format for compatibility
        '-r 30'           // Framerate
      ])
      .save(OUTPUT_PATH)
      .on('start', (cmd) => {
        console.log('FFmpeg process started:', cmd);
      })
      .on('error', (err) => {
        console.error('Error generating video:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('Video generated successfully!');
        resolve(OUTPUT_PATH);
      });
  });
}

// Allow running standalone for testing
if (require.main === module) {
  createVideo({
    name: 'Teste de Produto',
    price: 'R$ 99,90'
  }).catch(console.error);
}

module.exports = { createVideo };
