# Raízes do Nordeste

Projeto frontend para o sistema de gestão de pedidos "Raízes do Nordeste".

## Tecnologias

- React 18
- TypeScript
- Vite
- React Router
- Axios

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Estrutura do Projeto

```
src/
├── app/              # Componente raiz da aplicação
├── modules/          # Módulos de funcionalidades (pages)
├── components/       # Componentes reutilizáveis
├── layouts/          # Layouts da aplicação
├── services/         # Serviços (API, etc)
├── styles/           # Estilos globais e utilitários
└── routes/           # Configuração de rotas
```

## API

A aplicação consome a API em `http://localhost:3000` (configurável via variável de ambiente `VITE_API_URL`).
