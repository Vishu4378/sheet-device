const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function nanoid(length = 8): string {
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
