// Recommandation CNIL (RGPD) pour un mot de passe utilisé seul (sans autre
// facteur d'authentification) : 12 caractères minimum, mélangeant majuscules,
// minuscules, chiffres et caractères spéciaux.
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_HINT =
  "12 caractères minimum, avec majuscules, minuscules, chiffres et caractères spéciaux.";

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!(hasLower && hasUpper && hasDigit && hasSpecial)) {
    return "Le mot de passe doit contenir majuscules, minuscules, chiffres et caractères spéciaux.";
  }
  return null;
}
