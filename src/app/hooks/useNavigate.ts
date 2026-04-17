import { getAppPath } from '../utils/basePath';

/**
 * Custom navigation hook for Figma Make environment
 * Replaces react-router's useNavigate
 */
export function useNavigate() {
  return (path: string) => {
    if (typeof window !== 'undefined' && (window as any).navigate) {
      (window as any).navigate(path);
    }
  };
}

/**
 * Get current route params (simple implementation)
 */
export function useParams<T = any>(): T {
  if (typeof window !== 'undefined') {
    const path = getAppPath(window.location.pathname);
    const parts = path.split('/');

    // Extract ID from paths like /co/review/:id
    if (parts.length > 3) {
      return { id: parts[parts.length - 1] } as T;
    }
  }
  return {} as T;
}
