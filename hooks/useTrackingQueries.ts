import { useQuery } from '@tanstack/react-query'
import { syncWithServer, syncSteppersWithServer } from '@/services/cache/tracking'
import { syncFormStatusWithServer } from '@/services/cache/forms'
import { api } from '@/services/api'

export function useAdminStatus() {
  return useQuery({
    queryKey: ['auth', 'admin-status'],
    queryFn: () => api.get('/auth/me').then((res) => Boolean(res.data?.isAdmin)),
  })
}

export function useTrackingData() {
  return useQuery({
    queryKey: ['tracking', 'analytics'],
    queryFn: syncWithServer,
  })
}

export function useFormStatus() {
  return useQuery({
    queryKey: ['forms', 'status'],
    queryFn: syncFormStatusWithServer,
  })
}

export function useSensorSteppers() {
  return useQuery({
    queryKey: ['steppers', 'sensors'],
    queryFn: () => syncSteppersWithServer('sensors'),
  })
}

export function useFormSteppers() {
  return useQuery({
    queryKey: ['steppers', 'forms'],
    queryFn: () => syncSteppersWithServer('forms'),
  })
}
