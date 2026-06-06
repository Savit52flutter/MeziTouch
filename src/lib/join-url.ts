export function getJoinUrl(origin: string, code: string): string {
  return `${origin}/join/${code.toUpperCase()}`;
}
