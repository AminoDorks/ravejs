export const isOk = (status: number) => status >= 200 && status < 300;
export const matchMeshId = (text: string): string =>
  text.match(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  )?.[0] || '';
