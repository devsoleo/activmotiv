package fr.devsoleo.activmotiv.api

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import com.reactnativecommunity.asyncstorage.next.Entry
import com.reactnativecommunity.asyncstorage.next.StorageModule
import fr.devsoleo.activmotiv.BuildConfig
import java.io.File
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

private const val API_VERSION = BuildConfig.VERSION_NAME
private const val PUBLIC_API_URL = BuildConfig.PUBLIC_API_URL

class Api(private val ctx: Context) {
    suspend fun getAccessToken(): String? {
        return try {
            val asyncStorage = StorageModule.getStorageInstance(ctx)

            val entries: List<Entry> = asyncStorage.getValues(listOf("accessToken"))

            entries
                .firstOrNull { it.key == "accessToken" }
                ?.value
        } catch (e: Exception) {
            Log.e("Api", "Error getting access token: ${e.message}", e)
            null
        }
    }

    suspend fun isAuthenticated(): Boolean {
        return (this.getAccessToken() != null)
    }

    suspend fun get(path: String, token: String?): String = withContext(Dispatchers.IO) {
        val connection = URL(PUBLIC_API_URL + path).openConnection() as HttpURLConnection

        connection.apply {
            requestMethod = "GET"
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("X-Client-Version", API_VERSION)
            setRequestProperty("Authorization", "Bearer $token")
        }

        connection.inputStream.bufferedReader().use {
            it.readText()
        }
    }

    suspend fun put(path: String, token: String?, json: String): String = withContext(Dispatchers.IO) {
        val connection = URL(PUBLIC_API_URL + path).openConnection() as HttpURLConnection

        connection.apply {
            requestMethod = "PUT"
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("X-Client-Version", API_VERSION)
            setRequestProperty("Authorization", "Bearer $token")
            doOutput = true
        }

        OutputStreamWriter(connection.outputStream).use {
            it.write(json)
        }

        connection.inputStream.bufferedReader().use {
            it.readText()
        }
    }

    suspend fun shouldShowPopups(): Boolean {
        val prefs = ctx.getSharedPreferences("activmotiv_prefs", Context.MODE_PRIVATE)

        return try {
            val token = getAccessToken() ?: return prefs.getBoolean("popups_enabled", false)
            val response = get("/popups/status", token)
            val json = JSONObject(response)
            val popups = json.optBoolean("popups", false)

            // Update local cached status with latest API value
            prefs.edit().putBoolean("popups_enabled", popups).apply()

            popups
        } catch (e: Exception) {
            Log.e("Api", "Error checking popups status, falling back to cached value: ${e.message}", e)
            // Fallback to last recorded status if network is unavailable
            prefs.getBoolean("popups_enabled", false)
        }
    }

    suspend fun getHiddenImagesMap(): Map<Int, Boolean> {
        val hiddenMap = mutableMapOf<Int, Boolean>()
        try {
            val asyncStorage = StorageModule.getStorageInstance(ctx.applicationContext)
            val entries = asyncStorage.getValues(listOf("cache_sam"))
            val cacheSamStr = entries.firstOrNull { it.key == "cache_sam" }?.value
            if (!cacheSamStr.isNullOrEmpty()) {
                val trimmed = cacheSamStr.trim()
                if (trimmed.startsWith("[")) {
                    val array = JSONArray(trimmed)
                    for (i in 0 until array.length()) {
                        val item = array.getJSONObject(i)
                        val imageId = item.optInt("image", -1)
                        val hidden = item.optBoolean("hidden", false)
                        if (imageId != -1) {
                            hiddenMap[imageId] = hidden
                        }
                    }
                } else if (trimmed.startsWith("{")) {
                    val obj = JSONObject(trimmed)
                    val keys = obj.keys()
                    while (keys.hasNext()) {
                        val key = keys.next()
                        val item = obj.optJSONObject(key)
                        if (item != null) {
                            val imageId = item.optInt("image", key.toIntOrNull() ?: -1)
                            val hidden = item.optBoolean("hidden", false)
                            if (imageId != -1) {
                                hiddenMap[imageId] = hidden
                            }
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("Api", "Error reading cache_sam from AsyncStorage: ${e.message}", e)
        }
        return hiddenMap
    }

    suspend fun syncSamImages(): Map<Int, Boolean> {
        val asyncStorage = StorageModule.getStorageInstance(ctx.applicationContext)
        val hiddenMap = mutableMapOf<Int, Boolean>()

        return try {
            val token = getAccessToken() ?: return getHiddenImagesMap()
            val response = get("/sam/images", token)
            val json = JSONObject(response)
            val imagesArray = json.optJSONArray("images") ?: JSONArray()

            // Update AsyncStorage 'cache_sam' key directly
            asyncStorage.setValues(listOf(Entry("cache_sam", imagesArray.toString())))

            for (i in 0 until imagesArray.length()) {
                val item = imagesArray.getJSONObject(i)
                val imageId = item.optInt("image", -1)
                val hidden = item.optBoolean("hidden", false)
                if (imageId != -1) {
                    hiddenMap[imageId] = hidden
                }
            }

            // Pre-cache unhidden images in background
            GlobalScope.launch(Dispatchers.IO) {
                for ((imageId, hidden) in hiddenMap) {
                    if (!hidden) {
                        val relativePath = getRelativePathForImageId(imageId)
                        getOrDownloadBitmap(ctx, relativePath)
                    }
                }
            }

            hiddenMap
        } catch (e: Exception) {
            Log.e("Api", "Error syncing SAM images from server: ${e.message}", e)
            getHiddenImagesMap()
        }
    }

    companion object {
        const val STATIC_BASE_URL = "https://activmotiv.fr/static/"
        const val STATIC_API_KEY = "b4b01d6c7472362a30ac5470aac7f6be"

        fun getStaticImageUrl(relativePath: String): String {
            return "$STATIC_BASE_URL$relativePath?key=$STATIC_API_KEY"
        }

        fun getRelativePathForImageId(imageId: Int): String {
            return when {
                imageId in 1..33 -> "illustrations/AP/AP_Exercice/APEX_${imageId}.jpg"
                imageId in 34..61 -> "illustrations/AP/AP_Loisirs/APLT_${imageId - 33}.jpg"
                imageId in 62..86 -> "illustrations/AP/AP_TransportsActifs/APTA_${imageId - 61}.jpg"
                imageId in 87..98 -> "illustrations/POS/US_Accomplissement/USAC_${imageId - 86}.jpg"
                imageId in 99..111 -> "illustrations/POS/US_Animaux/USAN_${imageId - 98}.jpg"
                imageId in 112..120 -> "illustrations/POS/US_Nature/USNA_${imageId - 111}.jpg"
                imageId in 121..137 -> "illustrations/POS/US_Plaisir/USPL_${imageId - 120}.jpg"
                imageId in 138..142 -> "illustrations/POS/US_RelationSociale/USRS_${imageId - 137}.jpg"
                else -> "illustrations/AP/AP_Exercice/APEX_1.jpg"
            }
        }

        suspend fun getOrDownloadBitmap(ctx: Context, relativePath: String): Bitmap? = withContext(Dispatchers.IO) {
            val file = File(ctx.cacheDir, "static_cache/$relativePath")
            if (!file.exists() || file.length() == 0L) {
                file.parentFile?.mkdirs()
                try {
                    val url = URL(getStaticImageUrl(relativePath))
                    val connection = url.openConnection() as HttpURLConnection
                    connection.connectTimeout = 10000
                    connection.readTimeout = 10000
                    connection.inputStream.use { input ->
                        file.outputStream().use { output ->
                            input.copyTo(output)
                        }
                    }
                } catch (e: Exception) {
                    Log.e("Api", "Failed to download static image $relativePath: ${e.message}")
                }
            }
            if (file.exists() && file.length() > 0L) {
                try {
                    BitmapFactory.decodeFile(file.absolutePath)
                } catch (e: Exception) {
                    Log.e("Api", "Error decoding bitmap from file $relativePath: ${e.message}")
                    null
                }
            } else {
                null
            }
        }
    }
}
