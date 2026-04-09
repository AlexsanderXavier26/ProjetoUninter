// Alexsander Xavier - 4338139
export function sanitizeString(str: string): string {
  return str?.replace(/[<>"'%;()&+]/g, '').trim();
}
