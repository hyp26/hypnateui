export const getMockTranslation = (text: string, targetLang: string): string | null => {
  // For this demo, we assume the original text is always in English.
  // If the target language is English, no translation is needed.
  if (targetLang === 'en') return null; 

  // Mock Dictionary for Hindi Translations
  const translations: Record<string, string> = {
    'Hi, I saw your Instagram ad.': 'नमस्ते, मैंने आपका इंस्टाग्राम विज्ञापन देखा।',
    'Is this available in blue?': 'क्या यह नीले रंग में उपलब्ध है?',
    'Price please?': 'कृपया कीमत बताएं?',
    'Payment sent.': 'भुगतान भेज दिया गया।',
    'Loved the packaging! 😍': 'पैकेजिंग बहुत पसंद आई! 😍',
    'Do you ship to Mumbai?': 'क्या आप मुंबई में डिलीवरी करते हैं?',
    'Can I get a bulk discount?': 'क्या मुझे थोक छूट मिल सकती है?',
    'Hi there!': 'नमस्ते!',
    'Hello, interested in the ceramic vases.': 'नमस्ते, सिरेमिक फूलदानों में रुचि है।',
    'I want to order the soap.': 'मैं साबुन ऑर्डर करना चाहता हूं।',
    'Received my order today.': 'आज मेरा ऑर्डर प्राप्त हुआ।',
    'Can you deliver by tomorrow?': 'क्या आप कल तक डिलीवरी कर सकते हैं?',
    'What are the payment options?': 'भुगतान के विकल्प क्या हैं?'
  };

  // Return exact match or a generic fallback for dynamic text
  return translations[text] || `[AI अनुवाद]: ${text}`;
};
