package fr.devsoleo.activmotiv.popup

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import fr.devsoleo.activmotiv.api.Api
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class PresenceReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_USER_PRESENT) {
            val startIntent = Intent(context, ImagesActivity::class.java)
            startIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK

            GlobalScope.launch {
                val api = Api(context)

                if (api.isAuthenticated()) {
                    context.startActivity(startIntent)
                }
            }
        }
    }
}