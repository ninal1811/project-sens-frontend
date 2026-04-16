const DEVELOPER_EMAIL = import.meta.env.VITE_DEVELOPER_EMAIL;

export function useAuth() {
  const userEmail = sessionStorage.getItem('email') || '';
  const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
  const isDeveloper = isLoggedIn && !!DEVELOPER_EMAIL && userEmail === DEVELOPER_EMAIL;

  return { isLoggedIn, isDeveloper, userEmail };
}
