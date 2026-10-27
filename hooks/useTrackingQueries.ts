import { useQuery } from '@tanstack/react-query'
import { syncWithServer, syncSteppersWithServer } from '@/services/cache/tracking'
import { syncFormStatusWithServer } from '@/services/cache/forms'

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
