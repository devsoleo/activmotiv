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

private const val API_VERSION = BuildConfig.VERSION_NAME
private const val PUBLIC_API_URL = BuildConfig.PUBLIC_API_URL

class Api(private val ctx: Context) {
    suspend fun getAccessToken(): String? {
        return try {
            val asyncStorage = StorageModule.getStorageInstance(ctx)

            val entries: List<Entry> = asyncStorage.getValues(listOf("accessToken"))

            val entries_sam: List<Entry> = asyncStorage.getValues(listOf("cache_sam"))
            val i = entries_sam.first()

            entries
                .firstOrNull { it.key == "accessToken" }
                ?.value
        } catch (e: Exception) {
            null
        }
    }

    suspend fun isAuthenticated(): Boolean {
        return (this.getAccessToken() != null)
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
}