import { WHATSAPP_NUMBER } from './constants';

export function generateWhatsAppUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function openWhatsAppOrder(productName: string, customMessage?: string): void {
  const message = customMessage || `Hello AISCA, I would like to order the ${productName}.`;
  const url = generateWhatsAppUrl(message);
  window.open(url, '_blank', 'noopener,noreferrer');
}
