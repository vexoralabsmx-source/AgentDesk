export const adminEmail = "vexoralabsmx@gmail.com";

export function isAdminEmail(email?: string | null) {
  return email?.toLowerCase() === adminEmail;
}
