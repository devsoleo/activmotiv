let signOutFn: (() => void) | null = null

export const setSignOut = (fn: () => void) => {
  signOutFn = fn
}

export const callSignOut = () => {
  if (signOutFn) {
    signOutFn()
  }
}