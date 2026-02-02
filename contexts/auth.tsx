import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react'

import { useStorageState } from './useStorageState'
import { useRouter } from 'expo-router'

import { setSignOut } from './authManager'
import { Alert } from 'react-native'

type AuthContextType = {
  signIn: (accessToken: string) => void
  signOut: () => void
  accessToken: string | null
}

const AuthContext = createContext<AuthContextType>({
  signIn: (accessToken: string) => null,
  signOut: () => null,
  accessToken: null
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

  const router = useRouter()

  const memo = useMemo(
    () => ({
      signIn: (accessToken: string) => {
        setAccessToken(accessToken)
      },
      signOut: () => {
        setAccessToken(null)
        router.replace('/(auth)/login')
      },
      accessToken,
    }),
    [accessToken]
  )

  useEffect(() => {
    setSignOut(memo.signOut)
  }, [memo.signOut])

  return (
    <AuthContext.Provider value={memo}>
      {children}
    </AuthContext.Provider>
  )
}
