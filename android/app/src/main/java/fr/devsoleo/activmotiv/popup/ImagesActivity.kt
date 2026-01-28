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
    private var topImageIndex: Int = 0
    private var bottomImageIndex: Int = 0

    private fun startExposureClock() {
        exposureTime = System.currentTimeMillis()
    }

    private fun stopExposureClock() : Long {
        val currentTime = System.currentTimeMillis()
        exposureTime = currentTime - exposureTime
        return currentTime
    }

    private fun saveMeasurement(time: Long, duration: Long, top: Int, bottom: Int) {
        GlobalScope.launch {
            val api = Api(applicationContext)

            try {
                if (api.isAuthenticated()) {
                    api.put("/tracking/opening", api.getAccessToken(), """{ "timestamp": $time, "duration": $duration, "images": { "top": $top, "bottom": $bottom } }""")
                }
            } catch (e: Exception) {
                Log.e("Error", e.message!!)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val (top, bottom) = getRandomIllustrations()

        topImageIndex = top.index
        bottomImageIndex = bottom.index

        setContent {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clickable { finish() }
            ) {
                StackedImages(top.resId, bottom.resId)
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
            saveMeasurement(time, exposureTime, topImageIndex, bottomImageIndex)
        }
        skip = false
    }

    private fun getRandomIllustrations(): Pair<SelectedImage, SelectedImage> {

        val sportIllustrations = listOf(
            R.drawable.ap1, R.drawable.ap2, R.drawable.ap3, R.drawable.ap4,
            R.drawable.ap5, R.drawable.ap6, R.drawable.ap7, R.drawable.ap8,
            R.drawable.ap9, R.drawable.ap10, R.drawable.ap11, R.drawable.ap12,
            R.drawable.ap13, R.drawable.ap14, R.drawable.ap15
        )

        val positiveIllustrations = listOf(
            R.drawable.pos1, R.drawable.pos2, R.drawable.pos3, R.drawable.pos4,
            R.drawable.pos5, R.drawable.pos6, R.drawable.pos7, R.drawable.pos8,
            R.drawable.pos9, R.drawable.pos10, R.drawable.pos11, R.drawable.pos12,
            R.drawable.pos13, R.drawable.pos14, R.drawable.pos15, R.drawable.pos16
        )

        val sportIndex = sportIllustrations.indices.random()
        val positiveIndex = positiveIllustrations.indices.random()

        return Pair(
            SelectedImage(
                resId = sportIllustrations[sportIndex],
                index = sportIndex + 1
            ),
            SelectedImage(
                resId = positiveIllustrations[positiveIndex],
                index = positiveIndex + 1
            )
        )
    }

}

data class SelectedImage(
    val resId: Int,
    val index: Int
)

@Composable
fun StackedImages(
    topImageRes: Int,
    bottomImageRes: Int
) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.SpaceEvenly,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Image(
            painter = painterResource(topImageRes),
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentDescription = "top_illustration",
        )
        Image(
            painter = painterResource(bottomImageRes),
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentScale = ContentScale.Crop,
            contentDescription = "bottom_illustration",
        )
    }
}