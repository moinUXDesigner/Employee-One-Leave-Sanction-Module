const baseUrl = import.meta.env.BASE_URL || '/';

function normalizeBasePath(path: string) {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }

  return path;
}

export const appBasePath = normalizeBasePath(baseUrl).replace(/\/$/, '');

export function getAppPath(pathname: string) {
  const normalizedPathname = normalizeBasePath(pathname);

  if (appBasePath && normalizedPathname.startsWith(appBasePath)) {
    const trimmedPath = normalizedPathname.slice(appBasePath.length);
    return trimmedPath || '/';
  }

  return normalizedPathname || '/';
}

export function getBrowserPath(appPath: string) {
  const normalizedAppPath = appPath.startsWith('/') ? appPath : `/${appPath}`;
  return appBasePath ? `${appBasePath}${normalizedAppPath}` : normalizedAppPath;
}
