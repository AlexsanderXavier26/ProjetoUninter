// Alexsander Xavier - 4338139
import React from 'react'
import styles from './ConsentModal.module.css'

interface Props {
  onAccept: () => void
}

const ConsentModal: React.FC<Props> = ({ onAccept }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Política de Privacidade</h2>
        <p>
          Para continuar utilizando o app precisamos do seu consentimento para
          tratamento de dados, conforme LGPD.
        </p>
        <button className={styles.accept} onClick={onAccept}>
          Aceitar
        </button>
      </div>
    </div>
  )
}

export default ConsentModal
