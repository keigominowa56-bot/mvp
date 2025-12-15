export function swaggerFallback(_t: unknown) {
  return (_req: unknown, _res: unknown, next: Function) => {
    next();
  };
}