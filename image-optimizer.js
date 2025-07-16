// Enhanced Image Optimization
import sharp from 'sharp';

class ImageOptimizer {
  constructor() {
    this.formats = ['webp', 'avif', 'jpeg'];
    this.sizes = [400, 800, 1200, 1600, 2000];
    this.quality = { webp: 80, avif: 70, jpeg: 85 };
  }
  
  async optimizeImage(inputPath, outputDir) {
    const filename = path.parse(inputPath).name;
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    const optimized = [];
    
    for (const format of this.formats) {
      for (const size of this.sizes) {
        if (size <= metadata.width) {
          const outputPath = path.join(outputDir, `${filename}-${size}w.${format}`);
          
          await image
            .resize(size, null, { withoutEnlargement: true })
            .toFormat(format, { quality: this.quality[format] })
            .toFile(outputPath);
            
          optimized.push({ path: outputPath, size, format });
        }
      }
    }
    
    return optimized;
  }
}

export default ImageOptimizer;
