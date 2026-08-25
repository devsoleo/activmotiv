package fr.devsoleo.activmotiv

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.NotificationManager.IMPORTANCE_DEFAULT
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.IBinder
import fr.devsoleo.activmotiv.popup.PresenceReceiver

class MainService : Service() {
    private val receiver = PresenceReceiver()

    override fun onCreate() {
        val filter = IntentFilter(Intent.ACTION_USER_PRESENT)
        applicationContext.registerReceiver(receiver, filter)
    }

    private fun startNotification() {
        val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, IMPORTANCE_DEFAULT).apply {
            description = "Canal POPUP"
        }

        val notificationManager: NotificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)

        val notification: Notification = Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("ActivMotiv")
            .setContentText("L'application est active.")
            .setSmallIcon(R.drawable.notification_icon)
            .build()

        startForeground(2, notification)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startNotification()
        return START_STICKY
    }

    override fun onDestroy() {
        applicationContext.unregisterReceiver(receiver)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    companion object {
        const val CHANNEL_ID = "POPUP"
        const val CHANNEL_NAME = "POPUP"
    }
}