/**
 * Translation Service
 * Provides text translation between Arabic and English using Google Translate API
 */

export type TranslationLanguage = 'ar' | 'en';

export interface TranslationResult {
  success: boolean;
  translatedText?: string;
  detectedLanguage?: string;
  error?: string;
}

/**
 * Translate text between Arabic and English
 * @param text - Text to translate
 * @param targetLanguage - Target language ('ar' for Arabic, 'en' for English)
 * @param sourceLanguage - Source language (optional, auto-detect if not provided)
 */
export async function translateText(
  text: string,
  targetLanguage: TranslationLanguage,
  sourceLanguage?: TranslationLanguage
): Promise<TranslationResult> {
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: 'Text cannot be empty',
    };
  }

  try {
    // Using Google Translate API (Free Tier)
    // Alternative: MyMemory Translation API (Free, no API key needed)
    const sourceLang = sourceLanguage || 'auto';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse the response - Google Translate returns nested arrays
    let translatedText = '';
    if (data && data[0]) {
      for (const item of data[0]) {
        if (item[0]) {
          translatedText += item[0];
        }
      }
    }

    // Detected language is in data[2]
    const detectedLanguage = data[2] || sourceLanguage;

    return {
      success: true,
      translatedText: translatedText || text,
      detectedLanguage,
    };
  } catch (error) {
    
    // Fallback to MyMemory API if Google Translate fails
    try {
      return await translateWithMyMemory(text, targetLanguage, sourceLanguage);
    } catch (fallbackError) {
      return {
        success: false,
        error: 'Translation service unavailable. Please try again later.',
      };
    }
  }
}

/**
 * Fallback translation using MyMemory API (no API key required)
 */
async function translateWithMyMemory(
  text: string,
  targetLanguage: TranslationLanguage,
  sourceLanguage?: TranslationLanguage
): Promise<TranslationResult> {
  const sourceLang = sourceLanguage || (targetLanguage === 'en' ? 'ar' : 'en');
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLanguage}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`MyMemory API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || 'Translation failed');
  }

  return {
    success: true,
    translatedText: data.responseData.translatedText,
    detectedLanguage: sourceLang,
  };
}

/**
 * Auto-detect language and translate to opposite language
 * Arabic -> English or English -> Arabic
 */
export async function autoTranslate(text: string): Promise<TranslationResult> {
  // Simple detection: check if text contains Arabic characters
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const targetLanguage: TranslationLanguage = hasArabic ? 'en' : 'ar';
  
  return translateText(text, targetLanguage);
}

/**
 * Translate multiple texts in batch
 */
export async function translateBatch(
  texts: string[],
  targetLanguage: TranslationLanguage,
  sourceLanguage?: TranslationLanguage
): Promise<TranslationResult[]> {
  const promises = texts.map(text => translateText(text, targetLanguage, sourceLanguage));
  return Promise.all(promises);
}

/**
 * Detect if text is in Arabic
 */
export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Get language name
 */
export function getLanguageName(lang: TranslationLanguage, displayLang: TranslationLanguage = 'en'): string {
  const names = {
    en: {
      ar: 'Arabic',
      en: 'English',
    },
    ar: {
      ar: 'العربية',
      en: 'الإنجليزية',
    },
  };
  return names[displayLang][lang];
}
