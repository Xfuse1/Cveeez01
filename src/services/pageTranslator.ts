import { translateBatch } from './translation';
import { isArabicText } from './translation';

type Lang = 'ar' | 'en';

// WeakMap to store original text nodes so we can revert
const originalTextMap: WeakMap<Node, string> = new WeakMap();

// Track current translated language (null = original)
(window as any).__pageTranslationState = (window as any).__pageTranslationState || null;

function detectTargetLanguage(): Lang {
  const bodyText = document.body ? document.body.innerText || '' : '';
  const hasArabic = isArabicText(bodyText);
  return hasArabic ? 'en' : 'ar';
}

function getTranslatableTextNodes(maxNodes = 1000): Text[] {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    ({
      acceptNode(node: Node) {
        // Skip empty/whitespace-only nodes
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        // Skip if within script, style, textarea, input, or elements marked data-no-translate
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'textarea', 'input', 'select'].includes(tag)) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
        // Skip code blocks and pre tags
        if (parent.closest('code') || parent.closest('pre')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    } as unknown) as NodeFilter
  );

  const nodes: Text[] = [];
  let n = walker.nextNode() as Text | null;
  while (n && nodes.length < maxNodes) {
    nodes.push(n);
    n = walker.nextNode() as Text | null;
  }
  return nodes;
}

export async function togglePageTranslation(forceTarget?: Lang): Promise<{ success: boolean; message?: string }> {
  try {
    const state = (window as any).__pageTranslationState as Lang | null;

    // If already translated and forceTarget matches or no forceTarget, revert to original
    if (state && (!forceTarget || forceTarget === state)) {
      // Revert all stored nodes
      originalTextMap && originalTextMap instanceof WeakMap && (function revertAll() {
        // We can't iterate WeakMap; instead walk and revert nodes that have originals
        const nodes = getTranslatableTextNodes(2000);
        nodes.forEach((node) => {
          const orig = originalTextMap.get(node);
          if (orig !== undefined) node.nodeValue = orig;
        });
      })();

      // Reset direction/lang
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
      (window as any).__pageTranslationState = null;
      return { success: true, message: 'Reverted to original language' };
    }

    // Determine target language
    const target: Lang = forceTarget || detectTargetLanguage();

    // Gather text nodes
    const nodes = getTranslatableTextNodes(2000);
    if (nodes.length === 0) return { success: true, message: 'Nothing to translate' };

    // Prepare texts array
    const texts = nodes.map((n) => n.nodeValue || '');

    // Batch size to avoid very large requests
    const batchSize = 20;
    for (let i = 0; i < texts.length; i += batchSize) {
      const chunk = texts.slice(i, i + batchSize);
      // call translateBatch
      const results = await translateBatch(chunk, target);
      // Apply translations to nodes and store originals
      for (let j = 0; j < results.length; j++) {
        const node = nodes[i + j];
        const res = results[j];
        if (!node) continue;
        if (!originalTextMap.has(node)) originalTextMap.set(node, node.nodeValue || '');
        if (res.success && res.translatedText) {
          node.nodeValue = res.translatedText;
        }
      }
    }

    // Update lang/dir
    document.documentElement.lang = target === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = target === 'ar' ? 'rtl' : 'ltr';
    (window as any).__pageTranslationState = target;

    return { success: true };
  } catch (error) {
    console.error('Page translation error:', error);
    return { success: false, message: 'Translation failed' };
  }
}

export function isPageTranslated(): boolean {
  return !!(window as any).__pageTranslationState;
}
