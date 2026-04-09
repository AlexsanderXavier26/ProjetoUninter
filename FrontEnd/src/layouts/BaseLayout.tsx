import React, { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import styles from './BaseLayout.module.css'

interface BaseLayoutProps {
  children: ReactNode
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, perfil } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isLoginPage = location.pathname === '/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  const isAdmin = perfil === 'ADMIN'
  const isGerente = perfil === 'GERENTE' || perfil === 'GERENTE_REGIONAL'
  const isFuncionario = perfil === 'FUNCIONARIO'
  const isCliente = perfil === 'CLIENTE'

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <nav className={styles.nav}>
          {isAdmin && (
            <> 
              <button onClick={() => navigate('/admin')} className={styles.navItem}>Dashboard</button>
              <button onClick={() => navigate('/admin')} className={styles.navItem}>Usuários</button>
              <button onClick={() => navigate('/admin')} className={styles.navItem}>Produtos</button>
              <button onClick={() => navigate('/admin')} className={styles.navItem}>Pedidos</button>
            </>
          )}
          {isGerente && (
            <>
              <button onClick={() => navigate('/gerente')} className={styles.navItem}>Dashboard</button>
              <button onClick={() => navigate('/gerente')} className={styles.navItem}>Pedidos</button>
            </>
          )}
          {isFuncionario && (
            <>
              <button onClick={() => navigate('/funcionario')} className={styles.navItem}>Pedidos</button>
            </>
          )}
          {isCliente && (
            <>
              <button onClick={() => navigate('/app')} className={styles.navItem}>Cardápio</button>
              <button onClick={() => navigate('/app')} className={styles.navItem}>Meus Pedidos</button>
            </>
          )}
        </nav>
        {isAuthenticated && (
          <button onClick={handleLogout} className={styles.logoutButtonAside}>Sair</button>
        )}
      </aside>
      <div className={styles.mainWithSidebar}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.brand}>
              <h1>Raízes do Nordeste</h1>
            </div>
            {isAuthenticated && (
              <div className={styles.userSection}>
                <span className={styles.userInfo}>
                  {perfil && <span className={styles.role}>{perfil}</span>}
                </span>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
