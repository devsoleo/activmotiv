import AsyncStorage from '@react-native-async-storage/async-storage'

// Raw
// C U D
async function setStorageItem(key, value) {
  if (value == null) {
    await AsyncStorage.removeItem(key)
  } else {
    await AsyncStorage.setItem(key, value)
  }
}

// R
async function getStorageItem(key) {
  const value = await AsyncStorage.getItem(key)
  return value
}

// Scope-Level
// C U
export async function setCache(scope, content) {
  await setStorageItem(`cache_${scope}`, JSON.stringify(content))
}

// R
export async function getCache(scope) {
  const cache = await JSON.parse(await getStorageItem(`cache_${scope}`))

  if (cache == null) return {}

  return cache
}

// D
export async function cleanCache(scope) {
  await setStorageItem(`cache_${scope}`, JSON.stringify({}))
}

// Item-level
// C U
export async function setItem(scope, key, value) {
  const cache = await getCache(scope)

  cache[key] = value

  setCache(scope, cache)
}

export async function getItem(scope, key) {
  const cache = await getCache(scope)

  return cache[key]
}


// function isEmptyObject(value) {
//   if (value == null) {
//     // null or undefined
//     return false;
//   }

//   if (typeof value !== 'object') {
//     // boolean, number, string, function, etc.
//     return false;
//   }

//   const proto = Object.getPrototypeOf(value);

//   // consider `Object.create(null)`, commonly used as a safe map
//   // before `Map` support, an empty object as well as `{}`
//   if (proto !== null && proto !== Object.prototype) {
//     return false;
//   }

//   return isEmpty(value);
// }

// export async function isCacheEmpty(scope) {
//   const cache = await JSON.parse(await getStorageItem(`cache_${scope}`))

//   console.log(isEmptyObject({ok: "e"}))

//   return "ok"
// }

export async function debugCache(namespace) {
  const cache = await getStorageItem(namespace)

  console.debug(`DEBUG CACHE ${namespace}:`, cache)
}