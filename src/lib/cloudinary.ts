'use server';

let cloudinary;

try {
  cloudinary = require('cloudinary').v2;
} catch (error) {
  console.error('❌ Cloudinary module not found. Please install it: npm install cloudinary');
  throw new Error('Cloudinary module is missing. Please install it first.');
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing Cloudinary environment variables');
  throw new Error('Cloudinary configuration is incomplete. Check your environment variables.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

export async function uploadToCloudinary(file: File): Promise<string> {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'talent-space',
      resource_type: 'auto',
      timeout: 30000,
    });

    if (!result.secure_url) {
      throw new Error('Failed to get image URL from Cloudinary');
    }

    return result.secure_url;

  } catch (error: any) {
    console.error('❌ Cloudinary Upload Error:', error);
    
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Please check your internet connection');
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

export async function validateCloudinaryConfig(): Promise<boolean> {
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
}
