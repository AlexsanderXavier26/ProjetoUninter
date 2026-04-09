// Alexsander Xavier - 4338139
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (apenas para desenvolvimento)
  // await prisma.usuario.deleteMany({})
  // await prisma.regiao.deleteMany({})
  // await prisma.unidade.deleteMany({})
  // await prisma.produto.deleteMany({})

  // Criar regiões
  console.log('📍 Criando regiões...')
  const regiao1 = await prisma.regiao.upsert({
    where: { id: 'regiao-1' },
    update: {},
    create: {
      id: 'regiao-1',
      nome: 'Região Nordeste',
      ativo: true,
    },
  })

  const regiao2 = await prisma.regiao.upsert({
    where: { id: 'regiao-2' },
    update: {},
    create: {
      id: 'regiao-2',
      nome: 'Região Norte',
      ativo: true,
    },
  })

  // Criar unidades
  console.log('🏢 Criando unidades...')
  const unidade1 = await prisma.unidade.upsert({
    where: { id: 'unidade-1' },
    update: {},
    create: {
      id: 'unidade-1',
      nome: 'Fortaleza - CE',
      regiaoId: regiao1.id,
      ativo: true,
    },
  })

  const unidade2 = await prisma.unidade.upsert({
    where: { id: 'unidade-2' },
    update: {},
    create: {
      id: 'unidade-2',
      nome: 'Recife - PE',
      regiaoId: regiao1.id,
      ativo: true,
    },
  })

  const unidade3 = await prisma.unidade.upsert({
    where: { id: 'unidade-3' },
    update: {},
    create: {
      id: 'unidade-3',
      nome: 'Belém - PA',
      regiaoId: regiao2.id,
      ativo: true,
    },
  })

  // Criar usuários
  console.log('👥 Criando usuários...')
  const adminPassword = await bcrypt.hash('adm123', 10)
  const userPassword = await bcrypt.hash('senha123', 10)

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      id: 'user-admin',
      nome: 'Administrador Master',
      email: 'admin@admin.com',
      senha: adminPassword,
      perfil: 'ADMIN',
      codigo: '123456',
      consentimento: true,
      ativo: true,
    },
  })

  const gerente = await prisma.usuario.upsert({
    where: { email: 'gerente@raizes.com' },
    update: {},
    create: {
      id: 'user-gerente',
      nome: 'Gerente Regional',
      email: 'gerente@raizes.com',
      senha: userPassword,
      perfil: 'GERENTE_REGIONAL',
      regiaoId: regiao1.id,
      consentimento: true,
      ativo: true,
    },
  })

  const funcionario = await prisma.usuario.upsert({
    where: { email: 'funcionario@raizes.com' },
    update: {},
    create: {
      id: 'user-funcionario',
      nome: 'Funcionário',
      email: 'funcionario@raizes.com',
      senha: userPassword,
      perfil: 'FUNCIONARIO',
      unidadeId: unidade1.id,
      consentimento: true,
      ativo: true,
    },
  })

  const cliente = await prisma.usuario.upsert({
    where: { email: 'cliente@raizes.com' },
    update: {},
    create: {
      id: 'user-cliente',
      nome: 'Cliente Teste',
      email: 'cliente@raizes.com',
      senha: userPassword,
      perfil: 'CLIENTE',
      consentimento: true,
      ativo: true,
    },
  })

  // Criar produtos
  console.log('📦 Criando produtos...')
  const produtos = await Promise.all([
    prisma.produto.upsert({
      where: { id: 'prod-1' },
      update: {},
      create: {
        id: 'prod-1',
        nome: 'Mangaba Congelada',
        descricao: 'Fruta congelada de alta qualidade',
        preco: 25.5,
        ativo: true,
      },
    }),
    prisma.produto.upsert({
      where: { id: 'prod-2' },
      update: {},
      create: {
        id: 'prod-2',
        nome: 'Goiaba Premium',
        descricao: 'Goiaba vermelha premium',
        preco: 30.0,
        ativo: true,
      },
    }),
    prisma.produto.upsert({
      where: { id: 'prod-3' },
      update: {},
      create: {
        id: 'prod-3',
        nome: 'Melancia Selecionada',
        descricao: 'Melancia doce e refrescante',
        preco: 45.0,
        ativo: true,
      },
    }),
    prisma.produto.upsert({
      where: { id: 'prod-4' },
      update: {},
      create: {
        id: 'prod-4',
        nome: 'Acerola Polpa',
        descricao: 'Polpa de acerola congelada',
        preco: 18.0,
        ativo: true,
      },
    }),
  ])

  // Criar disponibilidades de produtos
  console.log('📋 Criando disponibilidades de produtos...')
  for (const produto of produtos) {
    for (const unidade of [unidade1, unidade2, unidade3]) {
      await prisma.produtoDisponibilidade.upsert({
        where: {
          produtoId_unidadeId: {
            produtoId: produto.id,
            unidadeId: unidade.id,
          },
        },
        update: {},
        create: {
          produtoId: produto.id,
          unidadeId: unidade.id,
          disponivel: true,
        },
      })
    }

    // Criar estoque para cada unidade
    for (const unidade of [unidade1, unidade2, unidade3]) {
      await prisma.estoque.upsert({
        where: {
          unidadeId_produtoId: {
            unidadeId: unidade.id,
            produtoId: produto.id,
          },
        },
        update: {},
        create: {
          unidadeId: unidade.id,
          produtoId: produto.id,
          quantidade: 100,
          quantidadeMinima: 10,
          reservado: 0,
          ativo: true,
        },
      })
    }
  }

  // Criar funcionários adicionais
  console.log('👨‍💼 Criando funcionários adicionais...')
  const funcionarios = await Promise.all([
    prisma.usuario.upsert({
      where: { email: 'joao.silva@raizes.com' },
      update: {},
      create: {
        id: 'user-func-1',
        nome: 'João Silva',
        email: 'joao.silva@raizes.com',
        senha: userPassword,
        perfil: 'FUNCIONARIO',
        unidadeId: unidade1.id,
        consentimento: true,
        ativo: true,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'maria.santos@raizes.com' },
      update: {},
      create: {
        id: 'user-func-2',
        nome: 'Maria Santos',
        email: 'maria.santos@raizes.com',
        senha: userPassword,
        perfil: 'FUNCIONARIO',
        unidadeId: unidade2.id,
        consentimento: true,
        ativo: true,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'pedro.oliveira@raizes.com' },
      update: {},
      create: {
        id: 'user-func-3',
        nome: 'Pedro Oliveira',
        email: 'pedro.oliveira@raizes.com',
        senha: userPassword,
        perfil: 'FUNCIONARIO',
        unidadeId: unidade3.id,
        consentimento: true,
        ativo: true,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'ana.costa@raizes.com' },
      update: {},
      create: {
        id: 'user-func-4',
        nome: 'Ana Costa',
        email: 'ana.costa@raizes.com',
        senha: userPassword,
        perfil: 'FUNCIONARIO',
        unidadeId: unidade1.id,
        consentimento: true,
        ativo: true,
      },
    }),
  ])

  // Criar clientes adicionais
  console.log('🛒 Criando clientes adicionais...')
  const clientes = await Promise.all([
    prisma.usuario.upsert({
      where: { email: 'cliente1@email.com' },
      update: {},
      create: {
        id: 'user-cliente-1',
        nome: 'José Martins',
        email: 'cliente1@email.com',
        senha: userPassword,
        perfil: 'CLIENTE',
        consentimento: true,
        ativo: true,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'cliente2@email.com' },
      update: {},
      create: {
        id: 'user-cliente-2',
        nome: 'Francisca Almeida',
        email: 'cliente2@email.com',
        senha: userPassword,
        perfil: 'CLIENTE',
        consentimento: true,
        ativo: true,
      },
    }),
    prisma.usuario.upsert({
      where: { email: 'cliente3@email.com' },
      update: {},
      create: {
        id: 'user-cliente-3',
        nome: 'Carlos Ferreira',
        email: 'cliente3@email.com',
        senha: userPassword,
        perfil: 'CLIENTE',
        consentimento: true,
        ativo: true,
      },
    }),
  ])

  // Criar mais gerentes regionais
  console.log('🏛️ Criando gerentes regionais adicionais...')
  const gerente2 = await prisma.usuario.upsert({
    where: { email: 'gerente.norte@raizes.com' },
    update: {},
    create: {
      id: 'user-gerente-2',
      nome: 'Gerente Região Norte',
      email: 'gerente.norte@raizes.com',
      senha: userPassword,
      perfil: 'GERENTE_REGIONAL',
      regiaoId: regiao2.id,
      consentimento: true,
      ativo: true,
    },
  })

  // Criar pedidos de teste
  console.log('📊 Criando pedidos de teste...')
  const statusArray = ['CRIADO', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'FINALIZADO']
  const pedidos = await Promise.all([
    prisma.pedido.upsert({
      where: { id: 'pedido-1' },
      update: {},
      create: {
        id: 'pedido-1',
        usuarioId: cliente.id,
        unidadeId: unidade1.id,
        status: 'PAGO',
        valorTotal: 100.5,
        ativo: true,
      },
    }),
    prisma.pedido.upsert({
      where: { id: 'pedido-2' },
      update: {},
      create: {
        id: 'pedido-2',
        usuarioId: clientes[0]?.id || cliente.id,
        unidadeId: unidade1.id,
        status: 'FINALIZADO',
        valorTotal: 150.75,
        ativo: true,
      },
    }),
    prisma.pedido.upsert({
      where: { id: 'pedido-3' },
      update: {},
      create: {
        id: 'pedido-3',
        usuarioId: clientes[1]?.id || cliente.id,
        unidadeId: unidade2.id,
        status: 'PAGO',
        valorTotal: 85.0,
        ativo: true,
      },
    }),
    prisma.pedido.upsert({
      where: { id: 'pedido-4' },
      update: {},
      create: {
        id: 'pedido-4',
        usuarioId: cliente.id,
        unidadeId: unidade3.id,
        status: 'CRIADO',
        valorTotal: 200.0,
        ativo: true,
      },
    }),
  ])

  // Criar itens de pedidos
  console.log('🛍️ Criando itens de pedidos...')
  for (let i = 0; i < pedidos.length; i++) {
    const produtoIndex = i % produtos.length
    await prisma.itemPedido.create({
      data: {
        pedidoId: pedidos[i]?.id || 'pedido-1',
        produtoId: produtos[produtoIndex]?.id || 'prod-1',
        quantidade: 2 + i,
        nome: produtos[produtoIndex]?.nome || 'Produto Teste',
        preco: produtos[produtoIndex]?.preco || 25.5,
        regiaoId: regiao1.id,
      },
    })
  }

  // Criar fidelidade (pontos)
  console.log('⭐ Criando dados de fidelidade...')
  await prisma.fidelidade.upsert({
    where: { usuarioId: cliente.id },
    update: {},
    create: {
      usuarioId: cliente.id,
      pontos: 150,
    },
  })

  for (const cli of clientes) {
    if (cli?.id) {
      await prisma.fidelidade.upsert({
        where: { usuarioId: cli.id },
        update: {},
        create: {
          usuarioId: cli.id,
          pontos: Math.floor(Math.random() * 500),
        },
      })
    }
  }

  // Criar auditoria
  console.log('📝 Criando registros de auditoria...')
  await Promise.all([
    prisma.auditoria.create({
      data: {
        usuarioId: admin.id,
        acao: 'CRIAÇÃO',
        entidade: 'PRODUTO',
        entidadeId: produtos[0]?.id || 'prod-1',
        detalhes: 'Produto Mangaba criado pelo administrador',
      },
    }),
    prisma.auditoria.create({
      data: {
        usuarioId: gerente.id,
        acao: 'VISUALIZAÇÃO',
        entidade: 'PEDIDO',
        entidadeId: pedidos[0]?.id || 'pedido-1',
        detalhes: 'Pedido consultado pelo gerente regional',
      },
    }),
    prisma.auditoria.create({
      data: {
        usuarioId: funcionario.id,
        acao: 'ATUALIZAÇÃO',
        entidade: 'ESTOQUE',
        detalhes: 'Estoque atualizado manualmente',
      },
    }),
  ])

  console.log('✅ Seed concluído com sucesso!')
  console.log('📌 Dados de teste criados:')
  console.log('   Admin: admin@admin.com / adm123')
  console.log('   Gerente Nordeste: gerente@raizes.com / senha123')
  console.log('   Gerente Norte: gerente.norte@raizes.com / senha123')
  console.log('   Funcionários:')
  console.log('     - funcionario@raizes.com / senha123')
  console.log('     - joao.silva@raizes.com / senha123')
  console.log('     - maria.santos@raizes.com / senha123')
  console.log('     - pedro.oliveira@raizes.com / senha123')
  console.log('     - ana.costa@raizes.com / senha123')
  console.log('   Clientes:')
  console.log('     - cliente@raizes.com / senha123')
  console.log('     - cliente1@email.com / senha123')
  console.log('     - cliente2@email.com / senha123')
  console.log('     - cliente3@email.com / senha123')
  console.log('   Unidades: Fortaleza-CE, Recife-PE, Belém-PA')
  console.log('   Produtos: Mangaba, Goiaba, Melancia, Acerola')
  console.log('   Pedidos: 4 pedidos de teste criados')
  console.log('   Pontos de Fidelidade: Distribuídos entre clientes')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
