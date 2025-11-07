/**
 * Helper function to translate API message keys
 * 
 * Usage in React components:
 * import { useMessageTranslation, translateApiError } from '@/lib/utils/messageTranslator';
 * import { MESSAGES } from '@/lib/constants/messages';
 * 
 * const translateMessage = useMessageTranslation();
 * 
 * if (apiResponse.message === MESSAGES.AUTH.INVALID_CREDENTIALS) {
 *   showError(translateMessage(MESSAGES.AUTH.INVALID_CREDENTIALS));
 * }
 * 
 * Or use translateApiError for automatic translation:
 * catch (err: any) {
 *   const translatedError = translateApiError(err.message, translateMessage);
 *   setError(translatedError);
 * }
 */

import { useTranslation } from '@/hooks/useTranslation';
import { MESSAGES } from '@/lib/constants/messages';

/**
 * Hook to translate message keys from API responses
 * @returns Function that translates message keys
 */
export function useMessageTranslation() {
  const t = useTranslation('MESSAGES');
  
  return (messageKey: string): string => {
    // Convert MESSAGES.AUTH.INVALID_CREDENTIALS to AUTH.INVALID_CREDENTIALS
    const key = messageKey.replace(/^MESSAGES\./, '');
    
    // Try to get translation, fallback to original key if not found
    const translation = t(key);
    return translation !== key ? translation : messageKey;
  };
}

/**
 * Translate an API error message if it matches a known message key
 * @param errorMessage - The error message from API
 * @param translateFn - Translation function from useMessageTranslation hook
 * @returns Translated message if it matches a key, otherwise returns original message
 */
export function translateApiError(errorMessage: string, translateFn: (key: string) => string): string {
  if (!errorMessage) return errorMessage;
  
  // Check if the error message matches any known message key
  const allMessageKeys = Object.values(MESSAGES).flatMap(category => 
    Object.values(category as Record<string, string>)
  );
  
  // Check for exact match
  if (allMessageKeys.includes(errorMessage)) {
    return translateFn(errorMessage);
  }
  
  // Return original message if no match
  return errorMessage;
}

/**
 * Check if an API response message matches a message key and translate it
 * This is a utility function that can be used outside React components
 * @param apiMessage - The message from API response
 * @param messageKey - The message key to check against
 * @param translateFn - Translation function from useMessageTranslation hook
 * @returns Translated message if match, otherwise returns apiMessage
 */
export function checkAndTranslateMessage(
  apiMessage: string, 
  messageKey: string, 
  translateFn: (key: string) => string
): string {
  if (apiMessage === messageKey) {
    return translateFn(messageKey);
  }
  return apiMessage;
}

