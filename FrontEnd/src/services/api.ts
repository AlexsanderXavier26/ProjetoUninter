/// <reference types="vite/client" />
// Cliente Axios com interceptadores - Chamadas HTTP para Backend

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

/**
 * Configuração da API:
 * - Base URL: backend NestJS via proxy /api ou variável VITE_API_URL
 * - Headers padrão: Content-Type: application/json
 * - Interceptadores para Token JWT e tratamento de erros 401
 * 
 * Alexsander Xavier - 4338139
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || '/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * Configura interceptadores:
   * - Request: Adiciona token JWT no header Authorization
   * - Response: Trata erros 401 (não autenticado)
   * 
   * Alexsander Xavier - 4338139
   */
  private setupInterceptors() {
    // Interceptador de requisição: adiciona token - Alexsander Xavier - 4338139
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Interceptador de resposta: trata erros - Alexsander Xavier - 4338139
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Se receber 401 (não autorizado), não redireciona automaticamente:
        // fluxos públicos como Totem não devem perder o estado ou ir para login.
        if (error.response?.status === 401) {
          console.warn('[apiClient] 401 recebido, não redirecionando automaticamente')
        }
        return Promise.reject(error)
      }
    )
  }

  // Métodos públicos da API - Alexsander Xavier - 4338139
  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config)
  }

  public post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config)
  }

  public put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config)
  }

  public patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config)
  }

  public delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config)
  }
}

export const apiClient = new ApiClient()
