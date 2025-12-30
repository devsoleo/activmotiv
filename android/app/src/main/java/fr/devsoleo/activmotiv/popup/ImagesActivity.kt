package fr.devsoleo.activmotiv.popup

import androidx.activity.ComponentActivity
import androidx.compose.runtime.Composable
import androidx.compose.foundation.Image
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import android.os.Bundle
import android.util.Log
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.ui.Alignment
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import fr.devsoleo.activmotiv.R
import fr.devsoleo.activmotiv.api.Api
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class ImagesActivity : ComponentActivity() {
    private var exposureTime : Long = 0
    private var skip = false

    private fun startExposureClock() {
        exposureTime = System.currentTimeMillis()
    }

    private fun stopExposureClock() : Long {
        val currentTime = System.currentTimeMillis()
        exposureTime = currentTime - exposureTime
        return currentTime
    }

    private fun saveMeasurement(time: Long, duration: Long) {
        GlobalScope.launch {
            val api = Api(applicationContext)

            try {
                val accessToken = api.authenticate()

                if (accessToken != null) {
                    api.put("/tracking/opening", accessToken, """{ "timestamp": $time, "duration": $duration, "images": { "top": 0, "bottom": 0 } }""")
                }
            } catch (e: Exception) {
                Log.e("Error", e.message!!)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
         setContent {
             Box(
                 modifier = Modifier
                     .fillMaxSize()
                     .clickable { finish() }
             ) {
                 StackedImages()
             }
         }
    }

    override fun onRestart() {
        super.onRestart()
        skip = true
    }

    override fun onResume() {
        super.onResume()
        startExposureClock()
    }

    override fun onStop() {
        super.onStop()
        if (!skip) {
            val time = stopExposureClock()
            saveMeasurement(time, exposureTime)
        }
        skip = false
    }
}

@Composable
fun StackedImages() {
    val sportIllustrations: List<Int> = listOf(
        R.drawable.ap1,
        R.drawable.ap2,
        R.drawable.ap3,
        R.drawable.ap4,
        R.drawable.ap5,
        R.drawable.ap6,
        R.drawable.ap7,
        R.drawable.ap8,
        R.drawable.ap9,
        R.drawable.ap10,
        R.drawable.ap11,
        R.drawable.ap12,
        R.drawable.ap13,
        R.drawable.ap14,
        R.drawable.ap15
    )

    val positiveIllustrations: List<Int> = listOf(
        R.drawable.pos1,
        R.drawable.pos2,
        R.drawable.pos3,
        R.drawable.pos4,
        R.drawable.pos5,
        R.drawable.pos6,
        R.drawable.pos7,
        R.drawable.pos8,
        R.drawable.pos9,
        R.drawable.pos10,
        R.drawable.pos11,
        R.drawable.pos12,
        R.drawable.pos13,
        R.drawable.pos14,
        R.drawable.pos15,
        R.drawable.pos16
    )

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.SpaceEvenly,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Image(
            painter = painterResource(sportIllustrations.random()),
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentDescription = "sport_illustration",
        )
        Image(
            painter = painterResource(positiveIllustrations.random()),
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentScale = ContentScale.Crop,
            contentDescription = "positive_illustration",
        )
    }
}