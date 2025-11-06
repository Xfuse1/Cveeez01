
'use client';

declare global {
  interface Window {
    cloudinary: any;
  }
}

export class CloudinaryService {
  private static widget: any;

  // ✅ تهيئة Cloudinary Widget
  static initializeCloudinary(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Cloudinary can only be initialized in the browser'));
        return;
      }

      // إذا كان Cloudinary محمل بالفعل
      if (window.cloudinary) {
        resolve();
        return;
      }

      // تحميل Cloudinary script ديناميكياً
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Cloudinary widget loaded successfully');
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
            if (error) {
              console.error('❌ Cloudinary upload error:', error);
              reject(new Error(error.message || 'Upload failed'));
              return;
            }

            if (result.event === 'success') {
              console.log('✅ Image uploaded successfully:', result.info.secure_url);
              resolve(result.info.secure_url);
            } else if (result.event === 'close') {
              // User closed the widget, resolve with null to indicate no upload
              resolve(null);
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
