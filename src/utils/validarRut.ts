/**
 * Valida que el RUT tenga el formato 8 dígitos, un guion y un dígito verificador (0-9 o K)
 * Ejemplo válido: 20599582-K
 */
export function validarRut(rut: string): boolean {
  const rutLimpio = rut.replace(/\s+/g, "").toUpperCase();
  const regex = /^\d{8}-[\dK]$/;
  return regex.test(rutLimpio);
}