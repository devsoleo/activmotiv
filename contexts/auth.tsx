import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react'

import { useStorageState } from './useStorageState'
import { useRouter } from 'expo-router'
import { api } from '@/services/api'

import { setSignOut, setRefresh } from './authManager'

type AuthContextType = {
  signIn: (accessToken: string, refreshToken: string) => void
  signOut: () => void
  refresh: (currentRefreshToken: string | null) => void
  accessToken: string | null
  refreshToken: string | null
}

const AuthContext = createContext<AuthContextType>({
  signIn: (accessToken: string, refreshToken: string) => null,
  signOut: () => null,
  refresh: (currentRefreshToken: string | null) => null,
  accessToken: null,
  refreshToken: null
})

export function useSession() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />')
  }

  return value
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [[_, accessToken], setAccessToken] = useStorageState('accessToken')
  const [[_1, refreshToken], setRefreshToken] = useStorageState('refreshToken')

  const router = useRouter()

  const signIn = (accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
  }

  const signOut = () => {
    setAccessToken(null)
    setRefreshToken(null)
    router.replace('/(auth)/login')
  }

  const refresh = async (currentRefreshToken: string | null) => {
    try {
      const response = await api.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, { refreshToken: currentRefreshToken })

      const { accessToken, refreshToken } = response.data

      setAccessToken(accessToken)
      setRefreshToken(refreshToken)

      return { accessToken, refreshToken }
    } catch (error) {
      console.log(error)
      return null
    }
  }

  const memo = useMemo(() => ({ signIn, signOut, refresh, accessToken, refreshToken }), [accessToken, refreshToken])

  // Rends accessible signOut depuis axios (api.js)
  useEffect(() => setSignOut(memo.signOut), [memo.signOut])
  useEffect(() => setRefresh(memo.refresh), [memo.refresh])

  // Refresh automatique du token jwt au démarrage de l'appli
  // useEffect(() => {
  //   const tryRefresh = async () => {
  //     refresh(refreshToken)
  //   }

  //   tryRefresh()
  // }, [])

  return (
    <AuthContext.Provider value={memo}>
      {children}
    </AuthContext.Provider>
  )
}
