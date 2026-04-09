// Alexsander Xavier - 4338139
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Cliente: React.FC = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/app')
  }, [navigate])
  return null
}

export default Cliente
