// Alexsander Xavier - 4338139
// Dados de menu base e unidades para Raízes do Nordeste

export type Category = 'prato' | 'cerveja' | 'refrigerante' | 'combo'

export interface MenuProduct {
  id: string
  nome: string
  categoria: Category
  preco: number
  descricao: string
  imagem: string
  origem: string
  destaque?: boolean
}

export interface UnidadeInfo {
  nome: string
  adicionais: MenuProduct[]
}

export interface MenuByUnidade {
  id: string
  nome: string
  tema: string
}

// ================= BASE MENU =================

export const baseMenu: MenuProduct[] = [
  {
    id: 'b1',
    nome: 'Baião de Dois',
    categoria: 'prato',
    preco: 28.9,
    descricao: 'Feijão verde, arroz, carne seca e queijo coalho.',
    imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    origem: 'Vitória da Conquista - BA',
  },
  {
    id: 'b2',
    nome: 'Carne de Sol com Mandioca',
    categoria: 'prato',
    preco: 32.5,
    descricao: 'Carne de sol macia com mandioca cozida e manteiga.',
    imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    origem: 'Juazeiro do Norte - CE',
  },
  {
    id: 'b3',
    nome: 'Escondidinho de Carne Seca',
    categoria: 'prato',
    preco: 30.0,
    descricao: 'Purê de mandioca com carne seca desfiada.',
    imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    origem: 'Petrolina - PE',
  },
  {
    id: 'c1',
    nome: 'Skol',
    categoria: 'cerveja',
    preco: 7.5,
    descricao: 'Cerveja clara leve e refrescante.',
    imagem: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop',
    origem: 'Brasil',
  },
  {
    id: 'c2',
    nome: 'Brahma',
    categoria: 'cerveja',
    preco: 8.0,
    descricao: 'Cerveja de sabor suave para acompanhar pratos típicos.',
    imagem: 'https://images.unsplash.com/photo-1608270861620-7c95c2e93437?w=400&h=300&fit=crop',
    origem: 'Brasil',
  },
  {
    id: 'c3',
    nome: 'Heineken',
    categoria: 'cerveja',
    preco: 10.0,
    descricao: 'Cerveja premium com amargor equilibrado.',
    imagem: 'https://images.unsplash.com/photo-1608270861620-7c95c2e93437?w=400&h=300&fit=crop',
    origem: 'Internacional',
  },
  {
    id: 'r1',
    nome: 'Coca-Cola',
    categoria: 'refrigerante',
    preco: 6.5,
    descricao: 'Refrigerante clássico com gás.',
    imagem: 'https://images.unsplash.com/photo-1554866585-c4db5adc5d9d?w=400&h=300&fit=crop',
    origem: 'Internacional',
  },
  {
    id: 'r2',
    nome: 'Guaraná Antarctica',
    categoria: 'refrigerante',
    preco: 6.0,
    descricao: 'Refresco típico brasileiro.',
    imagem: 'https://images.unsplash.com/photo-1554866585-c4db5adc5d9d?w=400&h=300&fit=crop',
    origem: 'Manaus - AM',
  },
  {
    id: 'r3',
    nome: 'Fanta Laranja',
    categoria: 'refrigerante',
    preco: 6.0,
    descricao: 'Sabor frutado e refrescante.',
    imagem: 'https://images.unsplash.com/photo-1554866585-c4db5adc5d9d?w=400&h=300&fit=crop',
    origem: 'Brasil',
  },
]

// ================= UNIDADES =================

export const unidades: Record<string, UnidadeInfo> = {
  salvador: {
    nome: 'Salvador - BA',
    adicionais: [
      {
        id: 's1',
        nome: 'Acarajé',
        categoria: 'prato',
        preco: 14.9,
        descricao: 'Bolinho de feijão frito no dendê, servido com vatapá.',
        imagem: 'https://images.unsplash.com/photo-1610707267537-b85697eaf00f?w=400&h=300&fit=crop',
        origem: 'Salvador - BA',
      },
      {
        id: 's2',
        nome: 'Moqueca Baiana',
        categoria: 'prato',
        preco: 39.0,
        descricao: 'Moqueca com peixe, leite de coco e dendê.',
        imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        origem: 'Salvador - BA',
      },
    ],
  },
  recife: {
    nome: 'Recife - PE',
    adicionais: [
      {
        id: 'r4',
        nome: 'Bolo de Rolo',
        categoria: 'prato',
        preco: 12.0,
        descricao: 'Doce pernambucano enrolado com goiabada.',
        imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
        origem: 'Recife - PE',
      },
      {
        id: 'r5',
        nome: 'Carne de Sol com Macaxeira',
        categoria: 'prato',
        preco: 33.0,
        descricao: 'Carne de sol desfiada com macaxeira purê.',
        imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        origem: 'Recife - PE',
      },
    ],
  },
  fortaleza: {
    nome: 'Fortaleza - CE',
    adicionais: [
      {
        id: 'f1',
        nome: 'Peixada Cearense',
        categoria: 'prato',
        preco: 36.0,
        descricao: 'Peixe ensopado com legumes e pirão.',
        imagem: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        origem: 'Fortaleza - CE',
      },
      {
        id: 'f2',
        nome: 'Caranguejada',
        categoria: 'prato',
        preco: 42.0,
        descricao: "Caranguejo temperado com farofa d'água.",
        imagem: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        origem: 'Fortaleza - CE',
      },
    ],
  },
  natal: {
    nome: 'Natal - RN',
    adicionais: [
      {
        id: 'n1',
        nome: 'Ginga com Tapioca',
        categoria: 'prato',
        preco: 25.0,
        descricao: 'Tapioca recheada com ginga de peixe.',
        imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        origem: 'Natal - RN',
      },
      {
        id: 'n2',
        nome: 'Camarão na Manteiga',
        categoria: 'prato',
        preco: 48.0,
        descricao: 'Camarões grelhados no molho de manteiga.',
        imagem: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        origem: 'Natal - RN',
      },
    ],
  },
  sao_luis: {
    nome: 'São Luís - MA',
    adicionais: [
      {
        id: 'sl1',
        nome: 'Arroz de Cuxá',
        categoria: 'prato',
        preco: 38.0,
        descricao: 'Arroz com molho de vinagreira e camarão seco.',
        imagem: 'https://images.unsplash.com/photo-1558808456-1ae8950f4b3f?w=400&h=300&fit=crop',
        origem: 'São Luís - MA',
      },
      {
        id: 'sl2',
        nome: 'Peixe Frito com Farofa',
        categoria: 'prato',
        preco: 34.0,
        descricao: 'Peixe frito servido com farofa crocante.',
        imagem: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
        origem: 'São Luís - MA',
      },
    ],
  },
}

// ================= COMBOS =================

export const combos: MenuProduct[] = [
  {
    id: 'combo1',
    nome: 'Combo Nordestino',
    categoria: 'combo',
    preco: 45.0,
    descricao: 'Baião de Dois + Coca-Cola com preço especial.',
    imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    origem: 'Região Nordeste',
    destaque: true,
  },
  {
    id: 'combo2',
    nome: 'Combo Praia',
    categoria: 'combo',
    preco: 55.0,
    descricao: 'Peixada Cearense + Heineken com desconto.',
    imagem: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    origem: 'Região Nordeste',
    destaque: true,
  },
  {
    id: 'combo3',
    nome: 'Combo Duplo',
    categoria: 'combo',
    preco: 90.0,
    descricao: '2 pratos + 2 bebidas com desconto.',
    imagem: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    origem: 'Região Nordeste',
    destaque: true,
  },
]

// ================= LISTA DE UNIDADES =================

export const listaUnidades: MenuByUnidade[] = [
  { id: 'salvador', nome: 'Salvador', tema: 'salvador' },
  { id: 'recife', nome: 'Recife', tema: 'recife' },
  { id: 'fortaleza', nome: 'Fortaleza', tema: 'fortaleza' },
  { id: 'natal', nome: 'Natal', tema: 'natal' },
  { id: 'sao_luis', nome: 'São Luís', tema: 'sao_luis' },
]