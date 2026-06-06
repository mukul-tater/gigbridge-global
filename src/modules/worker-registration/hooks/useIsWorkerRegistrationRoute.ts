import { useLocation } from 'react-router-dom';

const WORKER_REGISTRATION_PATHS = ['/', '/register', '/login', '/home', '/onboarding'];

export function useIsWorkerRegistrationRoute(): boolean {
  const { pathname } = useLocation();
  return WORKER_REGISTRATION_PATHS.includes(pathname);
}
