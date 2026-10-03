import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { signInWithGoogle as googleSignIn } from '@/lib/firebase';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, isLoading, setSession, logout, updateUser, setLoading } =
    useAuthStore();

  // Initial user hydration query if token exists
  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await authApi.getMe();
      return data;
    },
    enabled: Boolean(token && !user),
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (meQuery.data) {
      setSession(meQuery.data, token);
      connectSocket(token);
    } else if (meQuery.isError) {
      logout();
    } else if (!token || user || meQuery.isFetched) {
      setLoading(false);
    }
  }, [meQuery.data, meQuery.isError, meQuery.isFetched, token, user]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      const token = data.token;
      const userData = data.user || data;
      setSession(userData, token);
      connectSocket(token);
      queryClient.invalidateQueries();
      toast.success('Welcome back!');
    },
    onError: (err) => {
      toast.error(err.message || 'Login failed.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      const token = data.token;
      const userData = data.user || data;
      setSession(userData, token);
      connectSocket(token);
      queryClient.invalidateQueries();
      toast.success('Account created successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Registration failed.');
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: async () => {
      const { idToken } = await googleSignIn();
      return authApi.firebaseAuth(idToken);
    },
    onSuccess: (data) => {
      const token = data.token;
      const userData = data.user || data;
      setSession(userData, token);
      connectSocket(token);
      queryClient.invalidateQueries();
      toast.success('Signed in with Google!');
    },
    onError: (err) => {
      toast.error(err.message || 'Google authentication failed.');
    },
  });

  const handleLogout = () => {
    logout();
    disconnectSocket();
    queryClient.clear();
    toast.info('Logged out.');
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || (Boolean(token) && meQuery.isLoading),
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    loginWithGoogle: googleAuthMutation.mutateAsync,
    isGoogleAuthenticating: googleAuthMutation.isPending,
    logout: handleLogout,
    updateUser,
  };
}
