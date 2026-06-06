import { useLocation } from 'react-router-dom';

const WORKER_PATHS = ['/', '/worker-start', '/register', '/login', '/home', '/onboarding'];

const EMITRA_PREFIX = '/emitra';
const PARTNER_PREFIX = '/partner';

/** Routes that use the new worker / E-Mitra shell (no legacy platform chrome). */
export function useIsActiveModuleRoute(): boolean {
  const { pathname } = useLocation();
  return (
    WORKER_PATHS.includes(pathname) ||
    pathname.startsWith(EMITRA_PREFIX) ||
    pathname.startsWith(PARTNER_PREFIX)
  );
}

/** @deprecated Use useIsActiveModuleRoute */
export function useIsWorkerRegistrationRoute(): boolean {
  return useIsActiveModuleRoute();
}
