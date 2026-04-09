// Alexsander Xavier - 4338139
/**
 * Configuração centralizada da URL da API
 * 
 * - Ambiente de produção: Usa VITE_API_URL (definida no .env)
 * - Ambiente de desenvolvimento: Fallback para http://localhost:3000
 * - Proxy local: /api (para vite.config.ts)
 * 
 * VITE_API_URL deve ser definida no arquivo .env:
 * VITE_API_URL=https://seu-backend-render.onrender.com
 */

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:3000'

/**
 * Função auxiliar para obter a URL da API
 */
export const getApiUrl = (): string => {
  return API_URL
}

/**
 * URL completa para um endpoint específico
 */
export const getApiEndpoint = (path: string): string => {
  const baseUrl = getApiUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}
