// Alexsander Xavier - 4338139
// Componente raiz da aplicação
/**
 * Estrutura:
 * 1. Routes do React Router - renderiza rotas definidas em router.tsx
 * 2. ClienteProvider - contexto para estado do cliente
 * 3. ToastProvider - contexto para notificações
 * 4. BaseLayout - layout com header, navegação e logout (escondido em algumas rotas)
 * 
 * Alexsander Xavier - 4338139
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { routes } from '@routes/router'
import { BaseLayout } from '@layouts/BaseLayout'
import { ClienteProvider } from '@modules/cliente/context/ClienteContext'
import { ToastProvider } from '@contexts/ToastContext'

function App() {
  const location = useLocation()
  
  // Algumas rotas não devem mostrar o layout (totem, login, register) - Alexsander Xavier - 4338139
  const hideLayout =
    location.pathname === '/totem' ||
    location.pathname === '/login' ||
    location.pathname === '/register'

  // Define as rotas da aplicação - Alexsander Xavier - 4338139
  const content = (
    <ClienteProvider>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Rota padrão: redireciona para Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ClienteProvider>
  )

  return (
    <ToastProvider>
      {hideLayout ? content : <BaseLayout>{content}</BaseLayout>}
    </ToastProvider>
  )
}

export default App

