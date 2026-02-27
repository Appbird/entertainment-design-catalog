export function resolveRuntimeBasePath(): string {
  return window.location.pathname.includes("/pages/") ? ".." : ".";
}

export function joinRuntimePath(basePath: string, relativePath: string): string {
  const trimmedBase = basePath.replace(/\/+$/, "");
  const trimmedRel = relativePath.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedRel}`;
}
