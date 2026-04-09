// Alexsander Xavier - 4338139
// Serviço de Unidades e Produtos - Cache de cardápio por unidade
/**
 * Responsável por:
 * - Buscar lista de unidades
 * - Buscar produtos por unidade
 * - Caching de dados
 * - Mock de dados para apresentação
 */

import { apiClient } from './api'

export interface Unit {
  id: string
  name: string
  city: string
  estado: string
  address: string
  phone: string
  hours: string
  active: boolean
  tipo: 'COMPLETA' | 'REDUZIDA'
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: 'PRATOS_EXECUTIVOS' | 'BEBIDAS' | 'ACOMPANHAMENTOS' | 'SOBREMESAS'
  available: boolean
  image?: string
  imageUrl?: string // TODO: inserir URL da imagem do produto aqui
  unitId?: string
  seasonal?: boolean
}

// Interface para Estoque - Alexsander Xavier - 4338139
export interface Stock {
  id: string
  produtoId: string
  unidadeId: string
  quantidade: number
  quantidadeMinima: number
  atualizado: Date
}

// UNIDADES PADRONIZADAS - FONTE ÚNICA DO SISTEMA - Alexsander Xavier - 4338139
const MASTER_UNITS: Unit[] = [
  {
    id: 'unit-bh',
    name: 'Raízes Belo Horizonte',
    city: 'Belo Horizonte',
    estado: 'MG',
    address: 'Av. Getúlio Vargas, 1000 - Centro',
    phone: '(31) 3241-5000',
    hours: 'Seg-Dom: 11h-23h',
    active: true,
    tipo: 'COMPLETA'
  },
  {
    id: 'unit-rj',
    name: 'Raízes Rio de Janeiro',
    city: 'Rio de Janeiro',
    estado: 'RJ',
    address: 'Av. Rio Branco, 500 - Centro',
    phone: '(21) 2222-5000',
    hours: 'Seg-Dom: 11h-23h',
    active: true,
    tipo: 'COMPLETA'
  },
  {
    id: 'unit-sp',
    name: 'Raízes São Paulo',
    city: 'São Paulo',
    estado: 'SP',
    address: 'Av. Paulista, 1000 - Bela Vista',
    phone: '(11) 3333-5000',
    hours: 'Seg-Dom: 11h-23h',
    active: true,
    tipo: 'COMPLETA'
  },
  {
    id: 'unit-ctba',
    name: 'Raízes Curitiba',
    city: 'Curitiba',
    estado: 'PR',
    address: 'Rua XV de Novembro, 200 - Centro',
    phone: '(41) 4444-5000',
    hours: 'Seg-Dom: 11h-22h',
    active: true,
    tipo: 'REDUZIDA'
  },
  {
    id: 'unit-cl',
    name: 'Raízes Conselheiro Lafaiete',
    city: 'Conselheiro Lafaiete',
    estado: 'MG',
    address: 'Praça Tiradentes, 50 - Centro',
    phone: '(31) 5555-5000',
    hours: 'Seg-Dom: 11h-22h',
    active: true,
    tipo: 'REDUZIDA'
  }
]

// PRODUTOS PADRONIZADOS POR UNIDADE - Alexsander Xavier - 4338139
const MASTER_PRODUCTS: { [unitId: string]: Product[] } = {
  'unit-bh': [
    // Pratos Executivos
    { id: 'bh-prato1', name: 'Baião de Dois', description: 'Arroz, feijão, queijo coalho, carne seca', price: 28.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-bh' },
    { id: 'bh-prato2', name: 'Moqueca de Peixe', description: 'Peixe fresco com leite de coco, azeite de dendê', price: 35.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-bh' },
    { id: 'bh-prato3', name: 'Carne de Sol com Macaxeira', description: 'Carne de sol desfiada com purê de macaxeira', price: 32.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-bh' },
    // Bebidas
    { id: 'bh-bebida1', name: 'Cajuína', description: 'Suco fermentado de caju', price: 8.90, category: 'BEBIDAS', available: true, imageUrl: '', unitId: 'unit-bh' },
    { id: 'bh-bebida2', name: 'Cerveja Brahma', description: 'Cerveja pilsen', price: 6.90, category: 'BEBIDAS', available: true, imageUrl: '', unitId: 'unit-bh' },
    // Acompanhamentos
    { id: 'bh-acomp1', name: 'Farofa de Dendê', description: 'Farofa com azeite de dendê', price: 5.90, category: 'ACOMPANHAMENTOS', available: true, imageUrl: '', unitId: 'unit-bh' },
    { id: 'bh-acomp2', name: 'Vinagrete', description: 'Salada de tomate, cebola, coentro', price: 4.90, category: 'ACOMPANHAMENTOS', available: true, imageUrl: '', unitId: 'unit-bh' },
    // Sobremesas
    { id: 'bh-sobremesa1', name: 'Doce de Leite', description: 'Doce de leite caseiro', price: 7.90, category: 'SOBREMESAS', available: true, imageUrl: '', unitId: 'unit-bh' },
    { id: 'bh-sobremesa2', name: 'Bolo de Rolo', description: 'Bolo fino enrolado com goiabada', price: 9.90, category: 'SOBREMESAS', available: true, imageUrl: '', unitId: 'unit-bh' }
  ],
  'unit-rj': [
    // Pratos Executivos
    { id: 'rj-prato1', name: 'Feijoada Completa', description: 'Feijoada com arroz, couve, farofa', price: 29.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-rj' },
    { id: 'rj-prato2', name: 'Bobó de Camarão', description: 'Camarão com creme de aipim', price: 38.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-rj' },
    { id: 'rj-prato3', name: 'Picanha na Brasa', description: 'Picanha grelhada com temperos nordestinos', price: 42.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-rj' },
    // Bebidas
    { id: 'rj-bebida1', name: 'Tapioca', description: 'Bebida de tapioca', price: 7.90, category: 'BEBIDAS', available: true, imageUrl: '', unitId: 'unit-rj' },
    { id: 'rj-bebida2', name: 'Refrigerante Guarana', description: 'Refrigerante de guaraná', price: 5.90, category: 'BEBIDAS', available: true, imageUrl: '', unitId: 'unit-rj' },
    // Acompanhamentos
    { id: 'rj-acomp1', name: 'Arroz Branco', description: 'Arroz branco soltinho', price: 3.90, category: 'ACOMPANHAMENTOS', available: true, imageUrl: '', unitId: 'unit-rj' },
    { id: 'rj-acomp2', name: 'Batata Frita', description: 'Batata frita crocante', price: 6.90, category: 'ACOMPANHAMENTOS', available: true, imageUrl: '', unitId: 'unit-rj' },
    // Sobremesas
    { id: 'rj-sobremesa1', name: 'Pudim de Leite', description: 'Pudim cremoso', price: 8.90, category: 'SOBREMESAS', available: true, imageUrl: '', unitId: 'unit-rj' },
    { id: 'rj-sobremesa2', name: 'Cocada', description: 'Doce de coco ralado', price: 6.90, category: 'SOBREMESAS', available: true, imageUrl: '', unitId: 'unit-rj' }
  ],
  'unit-sp': [
    // Pratos Executivos
    { id: 'sp-prato1', name: 'Buchada de Bode', description: 'Prato típico com bucho de bode', price: 31.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-sp' },
    { id: 'sp-prato2', name: 'Sarapatel', description: 'Prato com sangue e vísceras', price: 33.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-sp' },
    { id: 'sp-prato3', name: 'Frango com Quiabo', description: 'Frango caipira com quiabo', price: 26.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-sp' },
    // Bebidas
    { id: 'sp-bebida1', name: 'Suco de Manga', description: 'Suco natural de manga', price: 7.90, category: 'BEBIDAS', available: true, imageUrl: '', unitId: 'unit-sp' },
    { id: 'sp-bebida2', name: 'Água de Coco', description: 'Água de coco fresca', price: 6.90, category: 'BEBIDAS', available: true, imageUrl: '', unitId: 'unit-sp' },
    // Acompanhamentos
    { id: 'sp-acomp1', name: 'Couve Refogada', description: 'Couve refogada com alho', price: 4.90, category: 'ACOMPANHAMENTOS', available: true, imageUrl: '', unitId: 'unit-sp' },
    { id: 'sp-acomp2', name: 'Salada de Tomate', description: 'Tomate fresco com temperos', price: 5.90, category: 'ACOMPANHAMENTOS', available: true, imageUrl: '', unitId: 'unit-sp' },
    // Sobremesas
    { id: 'sp-sobremesa1', name: 'Rapadura', description: 'Doce de rapadura', price: 5.90, category: 'SOBREMESAS', available: true, imageUrl: '', unitId: 'unit-sp' },
    { id: 'sp-sobremesa2', name: 'Queijo Coalho', description: 'Queijo coalho assado', price: 8.90, category: 'SOBREMESAS', available: true, imageUrl: '', unitId: 'unit-sp' }
  ],
  'unit-ctba': [
    // Pratos Executivos (REDUZIDA - menos opções)
    { id: 'ctba-prato1', name: 'Baião de Dois', description: 'Arroz, feijão, queijo coalho', price: 25.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-ctba' },
    { id: 'ctba-prato2', name: 'Moqueca Simples', description: 'Peixe com leite de coco', price: 32.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-ctba' },
    // Bebidas
    { id: 'ct-bebida1', name: 'Cajuína', description: 'Suco fermentado de caju', price: 8.90, category: 'BEBIDAS', available: true, imageUrl: '', unitId: 'unit-ct' },
    // Acompanhamentos
    { id: 'ct-acomp1', name: 'Farofa', description: 'Farofa simples', price: 4.90, category: 'ACOMPANHAMENTOS', available: true, imageUrl: '', unitId: 'unit-ct' },
    // Sobremesas
    { id: 'ct-sobremesa1', name: 'Doce de Leite', description: 'Doce caseiro', price: 6.90, category: 'SOBREMESAS', available: true, imageUrl: '', unitId: 'unit-ct' }
  ],
  'unit-cl': [
    // Pratos Executivos (REDUZIDA - menos opções)
    { id: 'cl-prato1', name: 'Carne de Sol', description: 'Carne de sol desfiada', price: 29.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-cl' },
    { id: 'cl-prato2', name: 'Feijoada', description: 'Feijoada tradicional', price: 27.90, category: 'PRATOS_EXECUTIVOS', available: true, imageUrl: '', unitId: 'unit-cl' },
    // Bebidas
    { id: 'cl-bebida1', name: 'Refrigerante', description: 'Refrigerante gelado', price: 5.90, category: 'BEBIDAS', available: true, imageUrl: '', unitId: 'unit-cl' },
    // Acompanhamentos
    { id: 'cl-acomp1', name: 'Arroz', description: 'Arroz branco', price: 3.90, category: 'ACOMPANHAMENTOS', available: true, imageUrl: '', unitId: 'unit-cl' },
    // Sobremesas
    { id: 'cl-sobremesa1', name: 'Bolo', description: 'Bolo simples', price: 7.90, category: 'SOBREMESAS', available: true, imageUrl: '', unitId: 'unit-cl' }
  ]
}

class UnitService {
  private unitsCache: Unit[] | null = null
  private productsCache: Map<string, Product[]> = new Map()

  /**
   * Busca lista de unidades com padronização MASTER_UNITS
   * Alexsander Xavier - 4338139
   * Regras:
   * - Sempre retorna exatamente 5 unidades MASTER_UNITS
   * - API complementa dados (endereço, telefone, etc.) mas NÃO sobrescreve nomes
   * - Nomes sempre vêm do MASTER_UNITS
   */
  async getUnits(): Promise<Unit[]> {
    try {
      // Se tiver cache, retorna - Alexsander Xavier - 4338139
      if (this.unitsCache) {
        return this.unitsCache
      }

      // Tenta buscar da API para dados complementares - Alexsander Xavier - 4338139
      const response = await apiClient.get('/units')
      const apiUnits = Array.isArray(response.data) ? response.data : (response.data as any).data || []

      // Mescla dados: MASTER_UNITS + dados complementares da API
      const mergedUnits = this.mergeUnitsWithApi(MASTER_UNITS, apiUnits)
      this.unitsCache = mergedUnits
      return mergedUnits

    } catch (error) {
      // Fallback: usa apenas MASTER_UNITS - Alexsander Xavier - 4338139
      this.unitsCache = MASTER_UNITS
      return MASTER_UNITS
    }
  }

  /**
   * Mescla MASTER_UNITS com dados complementares da API
   * Alexsander Xavier - 4338139
   * Regras:
   * - Sempre retorna exatamente 5 unidades MASTER_UNITS
   * - API complementa dados (endereço, telefone) mas NUNCA sobrescreve nomes
   * - Nomes sempre vêm do MASTER_UNITS
   */
  private mergeUnitsWithApi(masterUnits: Unit[], apiUnits: any[]): Unit[] {
    return masterUnits.map(masterUnit => {
      // Busca dados complementares da API pelo ID
      const apiUnit = apiUnits.find(api => api.id === masterUnit.id)

      if (apiUnit) {
        // Mescla: mantém nome do MASTER, usa dados complementares da API
        return {
          ...masterUnit,
          address: apiUnit.endereco || apiUnit.address || masterUnit.address,
          phone: apiUnit.telefone || apiUnit.phone || masterUnit.phone,
          hours: apiUnit.horario || apiUnit.hours || masterUnit.hours,
          active: apiUnit.ativo !== false
        }
      }

      // Se não há dados da API, usa apenas MASTER
      return masterUnit
    })
  }

  /**
   * Mapeia ID do frontend para ID real do banco
   * Necessário pois frontend usa unit-bh, unit-rj, etc mas banco tem unidade-1, unidade-2, etc
   * Alexsander Xavier - 4338139
   */
  async getApiUnitId(frontendUnitId: string): Promise<string> {
    // Mapeamento manual: frontend IDs → banco IDs
    // Usar getUnits() para verificar se existe na API
    const units = await this.getUnits()
    
    // Se encontramos a unidade com esse ID, retorna (raro, mas seguro)
    const foundUnit = units.find(u => u.id === frontendUnitId)
    if (foundUnit?.id && foundUnit.id.startsWith('unidade-')) {
      return foundUnit.id
    }

    // Mapeamento de fallback: frontend IDs → IDs do banco
    const idMapping: { [key: string]: string } = {
      'unit-bh': 'unidade-1',
      'unit-sp': 'unidade-2',
      'unit-rj': 'unidade-3',
      'unit-ctba': 'unidade-1', // Fallback para primeira unidade
      'unit-cl': 'unidade-1'
    }

    return idMapping[frontendUnitId] || 'unidade-1'
  }

  /**
   * Mapeia ID do banco para o MASTER_UNITS frontend
   * Inverso de getApiUnitId - usado quando funcionário é carregado com unidadeId do banco
   * Alexsander Xavier - 4338139
   */
  async getFrontendUnitByBackendId(backendUnitId: string): Promise<Unit | null> {
    // Mapeamento inverso: banco IDs → frontend IDs
    const reverseMapping: { [key: string]: string } = {
      'unidade-1': 'unit-bh',
      'unidade-2': 'unit-sp',
      'unidade-3': 'unit-rj',
    }

    const frontendUnitId = reverseMapping[backendUnitId]
    if (!frontendUnitId) {
      return null
    }

    // Busca a unidade no MASTER_UNITS
    const units = await this.getUnits()
    return units.find(u => u.id === frontendUnitId) || null
  }

  /**
   * Mescla MASTER_PRODUCTS com dados complementares da API
   * Alexsander Xavier - 4338139
   * Regras:
   * - Sempre retorna produtos do MASTER_PRODUCTS
   * - API complementa dados (preços, disponibilidade) mas NUNCA sobrescreve nomes/descrições
   */
  private mergeProductsWithApi(masterProducts: Product[], apiProducts: any[]): Product[] {
    return masterProducts.map(masterProduct => {
      // Busca dados complementares da API pelo ID
      const apiProduct = apiProducts.find(api => api.id === masterProduct.id)

      if (apiProduct) {
        // Mescla: mantém nome/descrição do MASTER, usa dados complementares da API
        return {
          ...masterProduct,
          price: apiProduct.price || masterProduct.price,
          available: apiProduct.available !== false,
          image: apiProduct.image || masterProduct.image
        }
      }

      // Se não há dados da API, usa apenas MASTER
      return masterProduct
    })
  }

  /**
   * Busca produtos por unidade com MASTER_PRODUCTS
   * Alexsander Xavier - 4338139
   * Regras:
   * - Sempre retorna produtos do MASTER_PRODUCTS para a unidade
   * - API complementa dados (preços, disponibilidade) mas NÃO sobrescreve nomes/descrições
   */
  async getProductsByUnit(unitId: string): Promise<Product[]> {
    try {
      // Verifica cache - Alexsander Xavier - 4338139
      if (this.productsCache.has(unitId)) {
        const cached = this.productsCache.get(unitId) || []
        return cached
      }

      // Busca produtos MASTER para esta unidade
      const masterProducts = MASTER_PRODUCTS[unitId] || []

      // Tenta buscar dados complementares da API - Alexsander Xavier - 4338139
      const response = await apiClient.get<{ data: Product[] }>('/products', {
        params: { unitId },
      })
      const apiProducts = Array.isArray(response.data) ? response.data : response.data.data || []

      // Mescla MASTER_PRODUCTS com dados da API
      const mergedProducts = this.mergeProductsWithApi(masterProducts, apiProducts)

      if (mergedProducts.length === 0) {
        const fallbackProducts = this.getMockProductsByUnit(unitId)
        this.productsCache.set(unitId, fallbackProducts)
        return fallbackProducts
      }

      this.productsCache.set(unitId, mergedProducts)
      return mergedProducts

    } catch (error) {
      const fallbackProducts = this.getMockProductsByUnit(unitId)
      this.productsCache.set(unitId, fallbackProducts)
      return fallbackProducts
    }
  }

  /**
   * Busca produto específico
   * Alexsander Xavier - 4338139
   */
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/products/${productId}`)
      return response.data
    } catch (error) {
      return null
    }
  }

  /**
   * Mock de 5 unidades funcionando - Varia entre COMPLETA e REDUZIDA
   * Alexsander Xavier - 4338139
   * Garante variação de cardápio entre unidades
   */
  private getMockUnits(): Unit[] {
    return [
      {
        id: 'unit-bh',
        name: 'Raízes Belo Horizonte',
        city: 'Belo Horizonte',
        estado: 'MG',
        address: 'Av. Getúlio Vargas, 1000 - Centro',
        phone: '(31) 3241-5000',
        hours: 'Seg-Dom: 11h-23h',
        active: true,
        tipo: 'COMPLETA',
      },
      {
        id: 'unit-rj',
        name: 'Raízes Rio de Janeiro',
        city: 'Rio de Janeiro',
        estado: 'RJ',
        address: 'Av. Atlântica, 2500 - Copacabana',
        phone: '(21) 3251-7000',
        hours: 'Seg-Dom: 10h-23h',
        active: true,
        tipo: 'COMPLETA',
      },
      {
        id: 'unit-sp',
        name: 'Raízes São Paulo',
        city: 'São Paulo',
        estado: 'SP',
        address: 'Av. Paulista, 1578 - Centro',
        phone: '(11) 3088-2000',
        hours: 'Seg-Sex: 11h-23h | Sab-Dom: 12h-23h',
        active: true,
        tipo: 'COMPLETA',
      },
      {
        id: 'unit-ctba',
        name: 'Raízes Curitiba',
        city: 'Curitiba',
        estado: 'PR',
        address: 'Rua XV de Novembro, 450 - Centro',
        phone: '(41) 3221-6500',
        hours: 'Seg-Dom: 11h-22h',
        active: true,
        tipo: 'REDUZIDA',
      },
      {
        id: 'unit-cl',
        name: 'Raízes Conselheiro Lafaiete',
        city: 'Conselheiro Lafaiete',
        estado: 'MG',
        address: 'Rua Tupis, 250 - Centro',
        phone: '(31) 3761-1500',
        hours: 'Seg-Dom: 11h-21h',
        active: true,
        tipo: 'REDUZIDA',
      },
    ]
  }

  /**
   * Cardápio estruturado por categoria
   * Alexsander Xavier - 4338139
   * Produtos nordestinos realistas com imagens preparadas
   * Varia entre unidades COMPLETA e REDUZIDA
   */
  private getMockProductsByUnit(unitId: string): Product[] {
    const units = this.getMockUnits()
    const unit = units.find((u) => u.id === unitId)
    const isCOMPLETA = unit?.tipo === 'COMPLETA'
    const normalizedUnitId = unitId

    const fullMenu: Product[] = [
      {
        id: `${normalizedUnitId}-prod-001`,
        name: 'Baião de Dois',
        description: 'Arroz, feijão, queijo coalho, carne seca',
        price: 38.90,
        category: 'PRATOS_EXECUTIVOS',
        available: true,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-002`,
        name: 'Carne de Sol com Macaxeira',
        description: 'Acompanhado de arroz, feijão verde e farofa',
        price: 48.90,
        category: 'PRATOS_EXECUTIVOS',
        available: true,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-003`,
        name: 'Moqueca de Peixe',
        description: 'Peixe fresco ao leite de coco',
        price: 42.90,
        category: 'PRATOS_EXECUTIVOS',
        available: isCOMPLETA,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-004`,
        name: 'Acarajé com Camarão',
        description: 'Salgadinho de massa frita recheado com camarão seco',
        price: 28.90,
        category: 'PRATOS_EXECUTIVOS',
        available: true,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-005`,
        name: 'Suco de Caju',
        description: 'Fresco e natural',
        price: 12.90,
        category: 'BEBIDAS',
        available: true,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-006`,
        name: 'Água de Coco',
        description: 'Água de coco natural',
        price: 11.90,
        category: 'BEBIDAS',
        available: true,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-007`,
        name: 'Cerveja Artesanal',
        description: 'Produção local',
        price: 18.90,
        category: 'BEBIDAS',
        available: isCOMPLETA,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-008`,
        name: 'Macaxeira Frita',
        description: 'Porção crocante',
        price: 15.90,
        category: 'ACOMPANHAMENTOS',
        available: true,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-009`,
        name: 'Farofa de Carne Seca',
        description: 'Acompanhamento tradicional',
        price: 12.90,
        category: 'ACOMPANHAMENTOS',
        available: true,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-010`,
        name: 'Cartola',
        description: 'Pão com queijo e goiabada derretida',
        price: 18.90,
        category: 'SOBREMESAS',
        available: true,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
      {
        id: `${normalizedUnitId}-prod-011`,
        name: 'Pudim de Leite Condensado',
        description: 'Clássico tradicional',
        price: 16.90,
        category: 'SOBREMESAS',
        available: isCOMPLETA,
        imageUrl: '',
        unitId: normalizedUnitId,
      },
    ]

    const reducedCuritibaMenu: Product[] = [
      {
        id: 'unit-ctba-prod-001',
        name: 'Baião de Dois',
        description: 'Arroz, feijão verde e carne de sol',
        price: 25.90,
        category: 'PRATOS_EXECUTIVOS',
        available: true,
        imageUrl: '',
        unitId: 'unit-ctba',
      },
      {
        id: 'unit-ctba-prod-002',
        name: 'Moqueca Simples',
        description: 'Peixe com leite de coco',
        price: 32.90,
        category: 'PRATOS_EXECUTIVOS',
        available: true,
        imageUrl: '',
        unitId: 'unit-ctba',
      },
      {
        id: 'unit-ctba-bebida-001',
        name: 'Cajuína',
        description: 'Suco fermentado de caju',
        price: 8.90,
        category: 'BEBIDAS',
        available: true,
        imageUrl: '',
        unitId: 'unit-ctba',
      },
      {
        id: 'unit-ctba-acomp-001',
        name: 'Farofa',
        description: 'Farofa simples',
        price: 4.90,
        category: 'ACOMPANHAMENTOS',
        available: true,
        imageUrl: '',
        unitId: 'unit-ctba',
      },
      {
        id: 'unit-ctba-sobremesa-001',
        name: 'Doce de Leite',
        description: 'Doce caseiro',
        price: 6.90,
        category: 'SOBREMESAS',
        available: true,
        imageUrl: '',
        unitId: 'unit-ctba',
      },
    ]

    const reducedClMenu: Product[] = [
      {
        id: 'unit-cl-prod-001',
        name: 'Carne de Sol',
        description: 'Carne de sol desfiada',
        price: 29.90,
        category: 'PRATOS_EXECUTIVOS',
        available: true,
        imageUrl: '',
        unitId: 'unit-cl',
      },
      {
        id: 'unit-cl-prod-002',
        name: 'Feijoada',
        description: 'Feijoada tradicional',
        price: 27.90,
        category: 'PRATOS_EXECUTIVOS',
        available: true,
        imageUrl: '',
        unitId: 'unit-cl',
      },
      {
        id: 'unit-cl-bebida-001',
        name: 'Refrigerante',
        description: 'Refrigerante gelado',
        price: 5.90,
        category: 'BEBIDAS',
        available: true,
        imageUrl: '',
        unitId: 'unit-cl',
      },
      {
        id: 'unit-cl-acomp-001',
        name: 'Arroz',
        description: 'Arroz branco',
        price: 3.90,
        category: 'ACOMPANHAMENTOS',
        available: true,
        imageUrl: '',
        unitId: 'unit-cl',
      },
      {
        id: 'unit-cl-sobremesa-001',
        name: 'Bolo',
        description: 'Bolo simples',
        price: 7.90,
        category: 'SOBREMESAS',
        available: true,
        imageUrl: '',
        unitId: 'unit-cl',
      },
    ]

    if (normalizedUnitId === 'unit-ctba') {
      return reducedCuritibaMenu
    }

    if (normalizedUnitId === 'unit-cl') {
      return reducedClMenu
    }

    return fullMenu.filter((p) => p.available)
  }

  /**
   * Filtra produtos por categoria
   * Alexsander Xavier - 4338139
   */
  filterByCategory(
    products: Product[],
    category: Product['category']
  ): Product[] {
    return products.filter((p) => p.category === category)
  }

  /**
   * Busca produtos por nome
   * Alexsander Xavier - 4338139
   */
  searchProducts(products: Product[], query: string): Product[] {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
    )
  }

  /**
   * Retorna rótulo da categoria com ícone
   * Alexsander Xavier - 4338139
   */
  getCategoryLabel(category: Product['category']): string {
    const labels: { [key: string]: string } = {
      PRATOS_EXECUTIVOS: '🍽️ Pratos Executivos',
      BEBIDAS: '🥤 Bebidas',
      ACOMPANHAMENTOS: '🥘 Acompanhamentos',
      SOBREMESAS: '🍰 Sobremesas',
    }
    return labels[category] || category
  }

  /**
   * Extrai cidade do nome da unidade
   */
  private extractCityFromName(nome: string): string {
    if (!nome) return 'Cidade'
    const parts = nome.split(' - ')
    return parts[0] || nome
  }

  /**
   * Extrai estado do nome da unidade
   */
  private extractStateFromName(nome: string): string {
    if (!nome) return 'UF'
    const parts = nome.split(' - ')
    return parts[1] || 'UF'
  }

  /**
   * Determina tipo da unidade baseado no nome
   */
  private determineUnitType(nome: string): 'COMPLETA' | 'REDUZIDA' {
    if (!nome) return 'REDUZIDA'
    const lowerName = nome.toLowerCase()
    // Unidades completas: capitais e grandes cidades
    if (lowerName.includes('fortaleza') || lowerName.includes('recife') || lowerName.includes('belém')) {
      return 'COMPLETA'
    }
    return 'REDUZIDA'
  }
}

export const unitService = new UnitService()
