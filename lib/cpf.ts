export function isValidCPF(cpf: string): boolean {
  const cpfLimpo = cpf.toString().replace(/[^\d]/g, '')
  if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i)
  }
  const resto = 11 - (soma % 11)
  const digitoVerificador1 = resto > 9 ? 0 : resto
  if (digitoVerificador1 !== parseInt(cpfLimpo.charAt(9))) return false

  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i)
  }
  const resto2 = 11 - (soma % 11)
  const digitoVerificador2 = resto2 > 9 ? 0 : resto2
  if (digitoVerificador2 !== parseInt(cpfLimpo.charAt(10))) return false

  return true
} 