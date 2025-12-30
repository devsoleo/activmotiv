package fr.devsoleo.activmotiv.popup

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class PresenceReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_USER_PRESENT) {
            val startIntent = Intent(context, ImagesActivity::class.java)
            startIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK

            context.startActivity(startIntent)
        }
    }
}