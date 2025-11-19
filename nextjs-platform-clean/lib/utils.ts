// frontend/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSクラスを条件付きで結合し、競合するクラスを自動的に解決するヘルパー関数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}