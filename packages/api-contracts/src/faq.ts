export interface Faq {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
}

export interface FaqPayload {
  question: { az?: string; en: string };
  answer: { az?: string; en: string };
  sort_order: number;
}
