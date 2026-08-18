package fr.devsoleo.activmotiv.api

import android.content.Context
import com.reactnativecommunity.asyncstorage.next.Entry
import com.reactnativecommunity.asyncstorage.next.StorageModule
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import fr.devsoleo.activmotiv.BuildConfig
import android.util.Log
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
}
