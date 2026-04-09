// Alexsander Xavier - 4338139
export const getErrorMessage = (err: any): string => {
  if (!err) return ""
  if (typeof err === "string") return err
  if (err.response?.data?.message) return err.response.data.message
  if (err.message) return err.message
  return "Erro inesperado"
}
