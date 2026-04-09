// Alexsander Xavier - 4338139

import { baseMenu, combos, unidades, listaUnidades, MenuProduct } from '../data/menuData'

export interface MenuResponse {
  pratos: MenuProduct[]
  cervejas: MenuProduct[]
  refrigerantes: MenuProduct[]
  combos: MenuProduct[]
  unidade: { id: string; nome: string; tema: string }
}

export function getMenuByUnidade(unidadeId: string | null): MenuResponse {
  const id = unidadeId || 'salvador'

  // pega info da unidade (lista da UI)
  const unidadeInfo =
    listaUnidades.find((u) => u.id === id) || listaUnidades[0]

  // pega adicionais da unidade (dados)
  const adicionais = unidades[id]?.adicionais || []

  const fullMenu = [...baseMenu, ...adicionais]

  const pratos = fullMenu.filter((item) => item.categoria === 'prato')
  const cervejas = fullMenu.filter((item) => item.categoria === 'cerveja')
  const refrigerantes = fullMenu.filter((item) => item.categoria === 'refrigerante')

  return {
    pratos,
    cervejas,
    refrigerantes,
    combos,
    unidade: unidadeInfo,
  }
}

export function getAllUnidades() {
  return listaUnidades
}

export function getDestaques(): MenuProduct[] {
  return [...combos, ...baseMenu.filter((item) => item.destaque)].slice(0, 6)
}