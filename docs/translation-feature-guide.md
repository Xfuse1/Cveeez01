# Translation Feature Guide

## Overview
The translation feature allows users to translate text between Arabic and English instantly and for free. It's integrated into multiple parts of the application to help users work in their preferred language.

## Features

### 1. **Standalone Translator Page**
A dedicated page at `/translator` with a full-featured translation interface.

**Features:**
- Bidirectional translation (Arabic ↔ English)
- Auto-detect language
- Large text area for long texts
- Copy translated text
- Swap source and target languages
- Character count
- Free and unlimited usage

**Access:** 
- Navigate to `/translator`
- Or find it in the services section on the homepage

### 2. **CV Builder Integration**
Quick translate button integrated into the AI CV Builder prompt textarea.

**Features:**
- Translate button inside the prompt field
- Auto-detect and translate to opposite language
- Instant translation without leaving the page
- Helps users write prompts in either language

**How to Use:**
1. Go to AI CV Builder
2. Type your prompt in Arabic or English
3. Click the **Translate** button (bottom-right of textarea)
4. Text is automatically translated to the opposite language

### 3. **Translation Service API**
A reusable service that can be integrated anywhere in the app.

**Functions:**
```typescript
// Translate to specific language
translateText(text: string, targetLanguage: 'ar' | 'en', sourceLanguage?: 'ar' | 'en')

// Auto-detect and translate
autoTranslate(text: string)

// Batch translation
translateBatch(texts: string[], targetLanguage: 'ar' | 'en')

// Check if text is Arabic
isArabicText(text: string)
```

## Technical Details

### Translation Service
**File:** `src/services/translation.ts`

**APIs Used:**
1. **Primary:** Google Translate API (Free tier, no API key)
2. **Fallback:** MyMemory Translation API (Free, unlimited)

**Language Support:**
- Arabic (ar)
- English (en)

**Features:**
- Auto language detection
- Fallback mechanism for reliability
- Batch translation support
- Error handling

### Translator Component
**File:** `src/components/translator/Translator.tsx`

**Props:**
```typescript
interface TranslatorProps {
  initialText?: string;           // Pre-fill source text
  onTranslate?: (text: string) => void;  // Callback after translation
  showCard?: boolean;              // Wrap in card UI
  className?: string;              // Custom styling
}
```

**Usage Example:**
```tsx
import { Translator } from '@/components/translator/Translator';

<Translator 
  initialText="Hello World"
  onTranslate={(translated) => console.log(translated)}
  showCard={true}
/>
```

### Translator Page
**File:** `src/app/translator/page.tsx`

Full-page implementation with:
- Header and Footer
- Feature highlights
- Tips for best results
- Responsive design

## User Experience

### Standalone Translator
1. User navigates to `/translator`
2. Selects source and target languages (or uses auto-detect)
3. Types or pastes text
4. Clicks "Translate" or "Auto Translate"
5. Translation appears instantly
6. User can copy, swap languages, or continue translating

### CV Builder Integration
1. User types prompt in their native language
2. Clicks "Translate" button
3. Prompt is automatically translated
4. User can generate CV in either language

## Translation Quality

### Best Practices for Users:
- Use clear, simple sentences
- Avoid slang or regional dialects
- Use standard Arabic (Fusha) rather than colloquial
- Review translations for context
- Break long texts into paragraphs

### Limitations:
- Machine translation may not capture all nuances
- Technical terms may vary in accuracy
- Context-dependent phrases may need adjustment
- Idioms and metaphors may translate literally

## API Endpoints

### Google Translate API (Free)
```
GET https://translate.googleapis.com/translate_a/single
Parameters:
  - client: gtx
  - sl: source language (or 'auto')
  - tl: target language
  - dt: t (translation type)
  - q: text to translate (URL encoded)
```

### MyMemory API (Fallback)
```
GET https://api.mymemory.translated.net/get
Parameters:
  - q: text to translate (URL encoded)
  - langpair: source|target (e.g., 'en|ar')
```

**Rate Limits:**
- Google Translate: No official limit for free tier
- MyMemory: 1000 words/day without API key

## Integration Guide

### Add Translation to Any Component

1. **Import the service:**
```tsx
import { translateText, autoTranslate } from '@/services/translation';
```

2. **Add state:**
```tsx
const [isTranslating, setIsTranslating] = useState(false);
```

3. **Create handler:**
```tsx
const handleTranslate = async (text: string) => {
  setIsTranslating(true);
  const result = await autoTranslate(text);
  if (result.success) {
    console.log(result.translatedText);
  }
  setIsTranslating(false);
};
```

4. **Add UI button:**
```tsx
<Button onClick={() => handleTranslate(text)} disabled={isTranslating}>
  {isTranslating ? 'Translating...' : 'Translate'}
</Button>
```

## Future Enhancements

### Planned Features:
- [ ] More language pairs (French, Spanish, German)
- [ ] Translation history/cache
- [ ] Pronunciation guide
- [ ] Save favorite translations
- [ ] Offline translation (limited)
- [ ] Translation quality rating
- [ ] Integration with job descriptions
- [ ] CV content translation
- [ ] Real-time translation as you type

### Advanced Features:
- [ ] Voice input and output
- [ ] Document translation (PDF, DOCX)
- [ ] Custom terminology dictionary
- [ ] Translation memory for consistency
- [ ] Professional translation service integration

## Troubleshooting

### Translation Not Working
**Problem:** Translation fails or returns error

**Solutions:**
1. Check internet connection
2. Try again after a few seconds (API rate limit)
3. Reduce text length (try smaller chunks)
4. Check if text contains special characters
5. Service will automatically try fallback API

### Poor Translation Quality
**Problem:** Translation doesn't make sense

**Solutions:**
1. Simplify the source text
2. Break complex sentences into smaller ones
3. Use standard language (avoid slang)
4. Manually review and adjust translation
5. Try rephrasing the original text

### Button Not Responding
**Problem:** Translate button is disabled or not clickable

**Solutions:**
1. Ensure text field is not empty
2. Wait for previous translation to complete
3. Check for JavaScript errors in console
4. Refresh the page

## Privacy & Data

### Data Handling:
- Translation requests are sent to third-party APIs
- No text is stored on CVeeez servers
- Translation APIs may log requests temporarily
- No personal information is sent with translations

### Recommendations:
- Don't translate sensitive personal information
- Don't translate confidential business data
- Review privacy policies of translation services
- Use for general content only

## Support

For issues or questions about the translation feature:
1. Check this documentation first
2. Try the troubleshooting section
3. Contact support with specific error messages
4. Report bugs through the admin dashboard

## Credits

**Translation Services:**
- Google Translate API (Primary)
- MyMemory Translation API (Fallback)

**UI Components:**
- Shadcn/ui for interface elements
- Lucide React for icons
