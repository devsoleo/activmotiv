import { api } from '@/services/api'

import { debugCache, getCache, setCache } from '../cache'
import { setStorageItem } from '../storage'

export async function loadFromServer() {
  api.get(`/sam/images`)
  .then((response) => response.data)
  .then((data) => {
    setCache("sam", data.images)

    console.log("CACHE LOADED")
  })
  .catch((error) => {
    console.error(error)
  })
}

export function syncWithServer() {
  // api.put('/sam/all')
}

// Image

// C
export async function addImage(image) {
  const imageInCache = await getImage(image.image)

  if (imageInCache == undefined) {
    const cache = await getCache("sam")

    cache[cache.length] = image

    setCache("sam", cache)

    return
  }

  setImage(image.image, image)
}

// R
export async function getImage(imageId) {
  const cache = await getCache("sam")
  const image = cache.find(item => item.image === imageId)

  return image
}

// U
export async function setImage(imageId, image) {
  const cache = await getCache("sam")

  const imageIndex = cache.findIndex(item => item.image === imageId)

  cache[imageIndex] = image

  setCache("sam", cache)
}