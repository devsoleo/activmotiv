let signOutFn: (() => void) | null = null

export const setSignOut = (fn: () => void) => {
  signOutFn = fn
}

export const callSignOut = () => {
  if (signOutFn) {
    signOutFn()
  }
}

let refreshFn: ((currentRefreshToken: string | null) => Promise<{ accessToken: string, refreshToken: string }>) | null = null

// Pas besoin de async ici car setRefresh est juste un setter
export const setRefresh = (
  fn: (currentRefreshToken: string | null) => Promise<{ accessToken: string, refreshToken: string }>
) => {
  refreshFn = fn
}

// callRefresh devient async pour attendre le résultat
export const callRefresh = async (currentRefreshToken: string | null) => {
  if (refreshFn) {
    return refreshFn(currentRefreshToken) // retourne la promesse résolue
  }
  return null
}