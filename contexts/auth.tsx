import { use, createContext, type PropsWithChildren } from 'react'

import { useStorageState } from './useStorageState'

const AuthContext = createContext<{
  signIn: (accessToken: string, refreshToken: string) => void
  signOut: () => void
  accessToken?: string | null
  refreshToken?: string | null
}>({
  signIn: (token: string) => null,
  signOut: () => null,
  accessToken: null,
  refreshToken: null
})

// This hook can be used to access the user info.
export function useSession() {
  const value = use(AuthContext)
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />')
  }

  return value
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[_, accessToken], setAccessToken] = useStorageState('accessToken')
  const [[_1, refreshToken], setRefreshToken] = useStorageState('refreshToken')

  return (
    <AuthContext
      value={{
        signIn: (accessToken, refreshToken) => {
          setAccessToken(accessToken)
          setRefreshToken(refreshToken)
        },
        signOut: () => {
          setAccessToken(null)
          setRefreshToken(null)
        },
        accessToken,
        refreshToken
      }}>
      {children}
    </AuthContext>
  )
}
