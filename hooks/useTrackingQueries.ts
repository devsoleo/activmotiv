import { useQuery } from '@tanstack/react-query'
import { syncWithServer, syncSteppersWithServer } from '@/services/cache/tracking'
import { syncFormStatusWithServer } from '@/services/cache/forms'
import { api } from '@/services/api'

export function useAdminStatus() {
  return useQuery({
    queryKey: ['auth', 'admin-status'],
    queryFn: () => api.get('/auth/me').then((res) => Boolean(res.data?.isAdmin)),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['auth', 'user-profile'],
    queryFn: () => api.get('/auth/me').then((res) => res.data),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

export function useTrackingData() {
  return useQuery({
    queryKey: ['tracking', 'analytics'],
    queryFn: syncWithServer,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

export function useFormStatus() {
  return useQuery({
    queryKey: ['forms', 'status'],
    queryFn: syncFormStatusWithServer,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

export function useSensorSteppers() {
  return useQuery({
    queryKey: ['steppers', 'sensors'],
    queryFn: () => syncSteppersWithServer('sensors'),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

export function useFormSteppers() {
  return useQuery({
    queryKey: ['steppers', 'forms'],
    queryFn: () => syncSteppersWithServer('forms'),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}
