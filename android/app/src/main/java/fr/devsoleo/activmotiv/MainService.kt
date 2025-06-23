package fr.devsoleo.activmotiv

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.NotificationManager.IMPORTANCE_DEFAULT
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import androidx.annotation.RequiresApi
import fr.devsoleo.activmotiv.popup.PresenceReceiver

class MainService : Service() {
    private val receiver = PresenceReceiver()

    override fun onCreate() {
        super.onCreate()
        val filter = IntentFilter(Intent.ACTION_USER_PRESENT)
        applicationContext.registerReceiver(receiver, filter)
    }

    override fun onDestroy() {
        applicationContext.unregisterReceiver(receiver)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startNotification()
        return START_STICKY
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun startNotification() {
        val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, IMPORTANCE_DEFAULT).apply {
            description = "ActivMotiv Notification Channel"
        }

        val notificationManager: NotificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)

        val notification: Notification = Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("Notification titre")
            .setContentText("Notification contenu")
            .build()

        startForeground(2, notification)
    }

    companion object {
        const val CHANNEL_ID = "ActivMotivNotif"
        const val CHANNEL_NAME = "ActivMotiv"
    }
}