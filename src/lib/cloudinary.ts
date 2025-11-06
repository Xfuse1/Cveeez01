'use server';
import { v2 as cloudinary } from 'cloudinary';

// ✅ Configuration الآمنة
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // بدون NEXT_PUBLIC
  secure: true
});

export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // ✅ التحقق من وجود الملف
    if (!file) {
      throw new Error('No file provided');
    }

    // ✅ التحقق من حجم الملف (10MB كحد أقصى)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB');
    }

    // ✅ تحويل الملف إلى Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // ✅ رفع الصورة إلى Cloudinary مع معالجة الأخطاء
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'talent-space',
      resource_type: 'auto',
      timeout: 30000, // 30 ثانية timeout
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'talent_space_preset'
    });

    if (!result.secure_url) {
      throw new Error('Failed to get image URL from Cloudinary');
    }

    return result.secure_url;

  } catch (error: any) {
    console.error('❌ Cloudinary Upload Error:', error);
    
    // ✅ معالجة أنواع الأخطاء المختلفة
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Please check your internet connection');
    } else if (error.message.includes('File size')) {
      throw new Error(error.message);
    } else if (error.message.includes('Invalid API Key')) {
      throw new Error('Cloudinary configuration error: Please check your API keys');
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
};

// ✅ دالة مساعدة للتحقق من التكوين
export const validateCloudinaryConfig = (): boolean => {
  const required = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'NEXT_PUBLIC_CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Cloudinary environment variables:', missing);
    return false;
  }

  return true;
};


export default uploadToCloudinary;
