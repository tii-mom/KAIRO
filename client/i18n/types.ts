export type Locale = 'en-US' | 'zh-CN' | 'ko-KR';

export type TranslationValue = string | string[];

export interface MessageSchema {
  [key: string]: TranslationValue | MessageSchema;
}
