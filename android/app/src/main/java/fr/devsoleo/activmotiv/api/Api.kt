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

private const val API_VERSION = "3.0.0" // TAG : Upgrade Version
private const val PUBLIC_API_URL = BuildConfig.PUBLIC_API_URL // http://10.0.2.2:3000

class Api(private val ctx: Context) {
    suspend fun authenticate(): String? {
        return try {
            val asyncStorage = StorageModule.getStorageInstance(ctx)

            val entries: List<Entry> = asyncStorage.getValues(listOf("accessToken"))

            entries.find { it.key == "accessToken" }?.value.toString()
        } catch (e: Exception) {
            null
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
}