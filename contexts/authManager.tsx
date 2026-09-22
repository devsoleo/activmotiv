let signOutFn: (() => void | Promise<void>) | null = null

export const setSignOut = (fn: () => void | Promise<void>) => {
  signOutFn = fn
}

export const callSignOut = async () => {
  if (signOutFn) {
    await signOutFn()
  }
}