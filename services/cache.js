import { getStorageItem, setStorageItem } from '@/services/storage'

export async function setCache(scope, content) {
  await setStorageItem(`cache_${scope}`, JSON.stringify(content))
}

export async function getCache(scope) {
  const cache = await JSON.parse(await getStorageItem(`cache_${scope}`))

  return cache
}

export async function debugCache(namespace) {
  const cache = await getStorageItem(namespace)

  console.debug(`DEBUG CACHE ${namespace}:`, cache)
}