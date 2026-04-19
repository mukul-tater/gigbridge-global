// Push notifications require a service worker, which has been disabled
// project-wide. This hook is now a stub that reports the feature as
// unsupported so existing UI calls do not break.
export function usePushNotifications() {
  const subscribe = async (_vapidPublicKey?: string) => false;
  const unsubscribe = async () => false;

  return {
    isSupported: false,
    isSubscribed: false,
    isLoading: false,
    subscribe,
    unsubscribe,
  };
}
