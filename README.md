# Raízes do Nordeste

Projeto desenvolvido para simular um sistema de franquias com múltiplos canais de atendimento, incluindo aplicativo para clientes, totem de autoatendimento e painéis internos para gestão.

O sistema permite que o cliente realize pedidos, escolha forma de pagamento, acompanhe o status e interaja com a unidade selecionada, enquanto a operação interna controla pedidos, estoque e usuários.

---

## Tecnologias utilizadas

Backend:
- Node.js
- NestJS
- PostgreSQL / SQLite
- Prisma

Frontend:
- React
- TypeScript
- Vite
- Axios

Autenticação:
- JWT

---

## Como executar o projeto

### Backend

1. Acesse a pasta do projeto backend
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Gere o Prisma:
   ```bash
   npx prisma generate
   ```
4. Copie o arquivo `.env.example` para `.env` e configure as variáveis:
   ```bash
   cp .env.example .env
   ```
5. Inicie o servidor:
   ```bash
   npm run start:dev
   ```

A API estará disponível em:
http://localhost:3000

---

### Frontend

1. Acesse a pasta FrontEnd
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env` e configure as variáveis:
   ```bash
   cp .env.example .env
   ```
4. Inicie o projeto:
   ```bash
   npm run dev
   ```

A aplicação estará disponível em:
http://localhost:5173

---

## Deploy em Produção

### Backend (Render)

1. Crie uma conta no [Render](https://render.com)
2. Configure as variáveis de ambiente:
   - `PORT`: Deixe vazio (Render define automaticamente)
   - `DATABASE_URL`: String de conexão do banco PostgreSQL
   - `JWT_SECRET`: Chave secreta para JWT

3. Configure o comando de início:
   ```bash
   npm run build && npm run start:prod
   ```

### Frontend (Vercel)

1. Crie uma conta no [Vercel](https://vercel.com)
2. Configure a variável de ambiente:
   - `VITE_API_URL`: URL do backend no Render (ex: https://seu-backend.onrender.com)

3. O build será automático com Vite

---

## Funcionalidades

Aplicativo do cliente:
- Seleção de unidade
- Escolha de produtos
- Opção de retirada ou entrega
- Cadastro de endereço
- Pagamento simulado (PIX, cartão ou dinheiro)
- Acompanhamento do pedido
- Sistema de pontos

Totem de autoatendimento:
- Seleção de unidade
- Escolha de produtos
- Consumo no local ou retirada
- Pagamento simulado
- Geração de número do pedido

Painel administrativo:
- Criação e gerenciamento de usuários
- Controle de permissões (admin, gerente, funcionário)

Painel de funcionários:
- Visualização de pedidos por unidade
- Atualização de status dos pedidos
- Controle de estoque

Painel gerencial:
- Indicadores por unidade
- Produtividade e desempenho

---

## Observações

- Os dados são simulados
- O sistema não realiza pagamentos reais
- O foco está na modelagem do fluxo de pedidos, controle de acesso e integração entre canais
- Preparado para produção com variáveis de ambiente

---

## Autor

Alexsander Xavier - 4338139
