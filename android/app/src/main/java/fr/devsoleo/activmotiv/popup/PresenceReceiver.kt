package fr.devsoleo.activmotiv.popup

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.reactnativecommunity.asyncstorage.next.Entry
import com.reactnativecommunity.asyncstorage.next.StorageModule
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class PresenceReceiver : BroadcastReceiver() {
    suspend fun getJWT(ctx: Context): String? {
        return try {
            val asyncStorage = StorageModule.getStorageInstance(ctx)

            val entries: List<Entry> = asyncStorage.getValues(listOf("accessToken"))

            entries.find { it.key == "accessToken" }?.value
        } catch (e: Exception) {
            null
        }
    }

    suspend fun sendMeasurement(url: String, token: String, json: String): String =
    withContext(Dispatchers.IO) {
        val connection = URL(url).openConnection() as HttpURLConnection

        connection.apply {
            requestMethod = "PUT"
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("X-Client-Version", "2.0.0") // TAG : Upgrade Version
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

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_USER_PRESENT) {
            val startIntent = Intent(context, ImagesActivity::class.java)
            startIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK

            GlobalScope.launch {
                try {
                    val accessToken = getJWT(context)

                    if (accessToken != null) {
                        context.startActivity(startIntent)

                        sendMeasurement(url = "https://activmotiv.fr/tracking/opening", token = accessToken, json = """{ "measurements": "1" }""")
                    }
                } catch (e: Exception) {
                    Log.e("Error", e.message!!)
                }
            }

        }
    }
}