
'use client';

declare global {
  interface Window {
    cloudinary: any;
  }
}

export class CloudinaryService {
  private static widget: any;
  private static isScriptLoaded = false;

  // ✅ تهيئة Cloudinary Widget
  static initializeCloudinary(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        // Resolve silently on server, as it's not needed there.
        resolve();
        return;
      }

      // If already initialized
      if (this.isScriptLoaded && window.cloudinary) {
        resolve();
        return;
      }
      
      // If script is already loading
      if (document.querySelector('script[src*="cloudinary"]')) {
        // Simple wait and check, not ideal but avoids multiple script injections
        const interval = setInterval(() => {
          if (window.cloudinary) {
            clearInterval(interval);
            this.isScriptLoaded = true;
            resolve();
          }
        }, 100);
        return;
      }

      // تحميل Cloudinary script ديناميكياً
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Cloudinary widget loaded successfully');
        this.isScriptLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Cloudinary widget'));
      };
      
      document.head.appendChild(script);
    });
  }

  // ✅ فتح widget لرفع الصور
  static async openUploadWidget(options?: any): Promise<string | null> {
    try {
      await this.initializeCloudinary();

      return new Promise((resolve, reject) => {
        const cloudinaryOptions = {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'talent_space_preset',
          sources: ['local', 'camera', 'url'],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 10485760, // 10MB
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
          showAdvancedOptions: false,
          cropping: false,
          showPoweredBy: false,
          autoMinimize: true,
          singleUploadAutoClose: true,
          ...options
        };

        this.widget = window.cloudinary.createUploadWidget(
          cloudinaryOptions,
          (error: any, result: any) => {
            if (result && result.event === 'success') {
              console.log('✅ Image uploaded successfully:', result.info.secure_url);
              resolve(result.info.secure_url);
            } else if (result && result.event === 'close') {
              // User closed the widget, resolve with null to indicate no upload
              resolve(null);
            } else if (error) {
              console.error('❌ Cloudinary upload error:', error);
              reject(new Error(error.message || 'Upload failed'));
            }
          }
        );

        this.widget.open();
      });
    } catch (error: any) {
      console.error('❌ Failed to open upload widget:', error);
      throw new Error(`Cloudinary initialization failed: ${error.message}`);
    }
  }

  // ✅ إغلاق الـ widget
  static closeUploadWidget() {
    if (this.widget) {
      this.widget.close();
      this.widget = null;
    }
  }
}
