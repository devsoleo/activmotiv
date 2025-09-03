package fr.devsoleo.activmotiv.popup

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.reactnativecommunity.asyncstorage.next.Entry
import com.reactnativecommunity.asyncstorage.next.StorageModule
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class PresenceReceiver : BroadcastReceiver() {
    suspend fun getJWT(ctx: Context): String? {
        return try {
            // get instance of the Storage by providing context object
            val asyncStorage = StorageModule.getStorageInstance(ctx)

            val entries: List<Entry> = asyncStorage.getValues(listOf("accessToken"))

            // Recherche de l'accessToken dans les entrées
            entries.find { it.key == "accessToken" }?.value
        } catch (e: Exception) {
            Log.e("LESUPERTEST", "Erreur lors de la récupération du JWT: ${e.message}")
            null
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_USER_PRESENT) {
            val startIntent = Intent(context, ImagesActivity::class.java)
            startIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK

            GlobalScope.launch {
                try {
                    val accessToken = getJWT(context)

                    if (accessToken != null) {
                        Log.d("LESUPERTEST", "Je fais la requete avec le token : " + accessToken)
                        context.startActivity(startIntent)
                    } else {
                        Log.d("LESUPERTEST", "Je ne fais rien.")
                    }
                } catch (e: Exception) {
                    Log.e("Error", e.message!!)
                }
            }

        }
    }
}