import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'

export function useOnboardingStatus(enabled: boolean) {
  return useQuery({
    queryKey: ['auth', 'onboarding-status'],
    queryFn: () => api.get('/auth/onboarding-status').then((res) => res.data),
    enabled,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders').then((res) => res.data),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useUpdateReminders() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newReminders: any) => api.put('/reminders', newReminders),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}

export function useSamImages() {
  return useQuery({
    queryKey: ['sam', 'images'],
    queryFn: () => api.get('/sam/images').then((res) => res.data?.images || []),
    staleTime: 1000 * 60 * 60, // 1 heure
  })
}

export function useSaveSamBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: any[]) => api.put('/sam/batch', { items }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sam', 'images'] })
      await queryClient.invalidateQueries({ queryKey: ['auth', 'onboarding-status'] })
    },
  })
}
