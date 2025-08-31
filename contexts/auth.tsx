import { use, createContext, type PropsWithChildren } from 'react'

import { useStorageState } from './useStorageState'

const AuthContext = createContext<{
  signIn: (token: string) => void
  signOut: () => void
  accessToken?: string | null
}>({
  signIn: (token: string) => null,
  signOut: () => null,
  accessToken: null
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
        signIn: (token, refreshToken) => {
          setAccessToken(token)
          setRefreshToken(refreshToken)
        },
        signOut: () => {
          setAccessToken(null)
          setRefreshToken(null)
        },
        accessToken
      }}>
      {children}
    </AuthContext>
  )
}
