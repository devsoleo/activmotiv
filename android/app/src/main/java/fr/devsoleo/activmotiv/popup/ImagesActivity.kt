package fr.devsoleo.activmotiv.popup

import android.app.AlertDialog
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.lifecycle.lifecycleScope
import fr.devsoleo.activmotiv.api.Api
import kotlin.random.Random
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
                    api.put("/analytics/popup", api.getAccessToken(), """{ "timestamp": $time, "duration": $duration, "images": { "top": $top, "bottom": $bottom } }""")
                }
            } catch (e: Exception) {
                Log.e("Error", e.message!!)
            }
        }
    }

    private fun showOverlayPermissionDialog() {
        val isXiaomi = android.os.Build.MANUFACTURER.equals("Xiaomi", ignoreCase = true)
        
        val message = if (isXiaomi) {
            "Pour afficher les images de motivation, ActivMotiv nécessite l'autorisation d'affichage par-dessus les autres applications.\n\n" +
            "⚠️ IMPORTANT (Appareil Xiaomi/Redmi) :\n" +
            "Vous devez ÉGALEMENT activer les options suivantes dans le menu \"Autres autorisations\" de l'application :\n" +
            "• Afficher les fenêtres pop-up en arrière-plan\n" +
            "• Afficher sur l'écran de verrouillage\n\n" +
            "Souhaitez-vous ouvrir les paramètres maintenant ?"
        } else {
            "Pour afficher les images de motivation, ActivMotiv nécessite l'autorisation d'affichage par-dessus les autres applications. Souhaitez-vous l'activer maintenant ?"
        }

        AlertDialog.Builder(this)
            .setTitle("Permissions requises")
            .setMessage(message)
            .setPositiveButton("Paramètres") { _, _ ->
                var settingsOpened = false
                
                // 1. Try opening Xiaomi-specific permission editor if it's a Xiaomi device
                if (isXiaomi) {
                    try {
                        val intent = Intent("miui.intent.action.APP_PERM_EDITOR")
                        intent.setClassName("com.miui.securitycenter", "com.miui.permcenter.permissions.PermissionsEditorActivity")
                        intent.putExtra("extra_pkgname", packageName)
                        startActivity(intent)
                        settingsOpened = true
                    } catch (e: Exception) {
                        Log.e("XiaomiPermission", "Failed to launch MIUI permission editor", e)
                    }
                }

                // 2. Fallback 1: ACTION_MANAGE_OVERLAY_PERMISSION
                if (!settingsOpened) {
                    try {
                        val intent = Intent(
                            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:$packageName")
                        )
                        startActivity(intent)
                        settingsOpened = true
                    } catch (e: Exception) {
                        Log.e("OverlayPermission", "Failed to launch specific overlay permission", e)
                    }
                }

                // 3. Fallback 2: ACTION_APPLICATION_DETAILS_SETTINGS (App details settings)
                if (!settingsOpened) {
                    try {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                        intent.data = Uri.parse("package:$packageName")
                        startActivity(intent)
                    } catch (e: Exception) {
                        Log.e("AppSettings", "Failed to launch application settings", e)
                    }
                }
                finish()
            }
            .setNegativeButton("Plus tard") { dialog, _ ->
                dialog.dismiss()
                finish()
            }
            .setCancelable(false)
            .show()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. Alert system check for overlay permission (Redmi Note 9 pro / Xiaomi & others)
        if (!Settings.canDrawOverlays(this)) {
            showOverlayPermissionDialog()
            return
        }

        lifecycleScope.launch {
            val api = Api(applicationContext)

            // Sync SAM images status from server if authenticated
            if (api.isAuthenticated()) {
                try {
                    api.syncSamImages()
                } catch (e: Exception) {
                    Log.e("ImagesActivity", "Error syncing SAM images: ${e.message}")
                }
            }

            val hiddenMap = api.getHiddenImagesMap()
            val (sport, positive) = getRandomIllustrations(hiddenMap)

            // Randomly place AP (sport) at top or bottom
            val isApAtTop = Random.nextBoolean()

            val top = if (isApAtTop) sport else positive
            val bottom = if (isApAtTop) positive else sport

            topImageIndex = top.index
            bottomImageIndex = bottom.index

            // Retrieve or download cached Bitmaps for popup display
            val topBitmap = Api.getOrDownloadBitmap(applicationContext, top.relativePath)
            val bottomBitmap = Api.getOrDownloadBitmap(applicationContext, bottom.relativePath)

            // The swipe direction ALWAYS goes from AP (sport) to POS (positive)
            val isSwipeUp = !isApAtTop

            setContent {
            // Random horizontal position fraction (not too close to borders, between 0.25f and 0.75f)
            val startXFraction = remember { Random.nextFloat() * 0.5f + 0.25f }
            
            // Start and End vertical coordinates fraction (linking the two images)
            val startYFraction = remember(isSwipeUp) {
                if (isSwipeUp) Random.nextFloat() * 0.1f + 0.65f else Random.nextFloat() * 0.1f + 0.25f
            }
            val endYFraction = remember(isSwipeUp) {
                if (isSwipeUp) Random.nextFloat() * 0.1f + 0.25f else Random.nextFloat() * 0.1f + 0.65f
            }

            BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
                val widthPx = constraints.maxWidth.toFloat()
                val heightPx = constraints.maxHeight.toFloat()

                val startX = startXFraction * widthPx
                val startY = startYFraction * heightPx
                val endY = endYFraction * heightPx

                var isGestureActive by remember { mutableStateOf(false) }
                var draggedY by remember { mutableStateOf(startY) }

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(Unit) {
                            detectVerticalDragGestures(
                                onDragStart = { offset ->
                                    val distance = Math.hypot((offset.x - startX).toDouble(), (offset.y - startY).toDouble())
                                    // Touch detection zone of 300px radius
                                    isGestureActive = distance < 300.0
                                    draggedY = startY
                                },
                                onDragEnd = {
                                    isGestureActive = false
                                },
                                onDragCancel = {
                                    isGestureActive = false
                                },
                                onVerticalDrag = { change, dragAmount ->
                                    if (isGestureActive) {
                                        change.consume()
                                        draggedY = change.position.y
                                        
                                        // The popup closes ONLY when the arrival circle center coordinate is crossed
                                        if (isSwipeUp && draggedY <= endY) {
                                            finish()
                                        } else if (!isSwipeUp && draggedY >= endY) {
                                            finish()
                                        }
                                    }
                                }
                            )
                        }
                ) {
                    StackedImages(
                        topImageRes = top.resId,
                        topBitmap = topBitmap,
                        bottomImageRes = bottom.resId,
                        bottomBitmap = bottomBitmap
                    )

                    // Infinite animation for visual guides (ripples)
                    val infiniteTransition = rememberInfiniteTransition()
                    val progress by infiniteTransition.animateFloat(
                        initialValue = 0f,
                        targetValue = 1f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(durationMillis = 2000, easing = LinearEasing)
                        )
                    )

                    Canvas(modifier = Modifier.fillMaxSize()) {
                        // Radius of Start and Arrival circles increased by 50% (from 42f to 63f)

                        // 1. Draw static Start Circle (Cercle de départ)
                        drawCircle(
                            color = Color.White.copy(alpha = 0.5f),
                            radius = 63f,
                            center = Offset(startX, startY),
                            style = Stroke(width = 3f)
                        )

                        // 2. Draw static Arrival Circle (Cercle d'arrivée) - Filled with solid white background
                        drawCircle(
                            color = Color.White, // Solid white background
                            radius = 63f,
                            center = Offset(startX, endY)
                        )
                        drawCircle(
                            color = Color.White.copy(alpha = 0.7f),
                            radius = 63f,
                            center = Offset(startX, endY),
                            style = Stroke(width = 3f)
                        )

                        // 3. Draw pulsing ripple around the Start Circle
                        val startRippleScale = (progress * 2.5f).coerceAtMost(2.5f)
                        val startRippleAlpha = (1f - progress).coerceIn(0f, 1f)
                        drawCircle(
                            color = Color.White.copy(alpha = startRippleAlpha * 0.6f),
                            radius = 63f * startRippleScale,
                            center = Offset(startX, startY),
                            style = Stroke(width = 4f)
                        )

                        // 4. Draw a distinct, highly visible pulsing ripple around the Arrival Circle
                        val arrivalRippleScale = 1.0f + (progress * 1.5f)
                        val arrivalRippleAlpha = (1f - progress).coerceIn(0f, 1f)
                        drawCircle(
                            color = Color.White.copy(alpha = arrivalRippleAlpha * 0.5f),
                            radius = 63f * arrivalRippleScale,
                            center = Offset(startX, endY),
                            style = Stroke(width = 3f)
                        )

                        // 4b. Draw 4 regular arrowheads to trace the path (one less, thickened by 200%, size reduced by 10%)
                        val numArrows = 4
                        val arrowColor = Color.White.copy(alpha = 0.6f)
                        val arrowWidth = 72f
                        val arrowHeight = 54f
                        
                        for (i in 1..numArrows) {
                            val t = i.toFloat() / (numArrows + 1)
                            val arrowY = startY + (endY - startY) * t
                            
                            val path = androidx.compose.ui.graphics.Path().apply {
                                moveTo(startX, arrowY)
                                if (isSwipeUp) {
                                    lineTo(startX - arrowWidth, arrowY + arrowHeight)
                                    moveTo(startX, arrowY)
                                    lineTo(startX + arrowWidth, arrowY + arrowHeight)
                                } else {
                                    lineTo(startX - arrowWidth, arrowY - arrowHeight)
                                    moveTo(startX, arrowY)
                                    lineTo(startX + arrowWidth, arrowY - arrowHeight)
                                }
                            }
                            
                            drawPath(
                                path = path,
                                color = arrowColor,
                                style = Stroke(width = 30f, cap = androidx.compose.ui.graphics.StrokeCap.Round)
                            )
                        }

                        // 5. Draw the sliding indicator circle
                        val currentY = if (isGestureActive) {
                            if (isSwipeUp) {
                                draggedY.coerceIn(endY, startY)
                            } else {
                                draggedY.coerceIn(startY, endY)
                            }
                        } else {
                            startY
                        }

                        val totalDistance = Math.abs(endY - startY)
                        val remainingDistance = Math.abs(endY - currentY)
                        val isAboutToValidate = isGestureActive && totalDistance > 0f && (remainingDistance <= 150f || (remainingDistance / totalDistance) <= 0.25f)

                        // Outer glowing overlay
                        drawCircle(
                            color = if (isAboutToValidate) Color(0xFFAED581).copy(alpha = 0.7f) else Color.White.copy(alpha = 0.7f),
                            radius = 130f,
                            center = Offset(startX, currentY)
                        )
                        // Inner solid circle (Green when about to validate, Red otherwise)
                        drawCircle(
                            color = if (isAboutToValidate) Color(0xFF4CAF50).copy(alpha = 0.85f) else Color.Red.copy(alpha = 0.5f),
                            radius = 84f,
                            center = Offset(startX, currentY)
                        )
                        // Contrast border ring
                        drawCircle(
                            color = Color.White.copy(alpha = 0.9f),
                            radius = 84f,
                            center = Offset(startX, currentY),
                            style = Stroke(width = 3f)
                        )
                    }
                }
            }
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

    private fun getRelativePath(prefix: String, i: Int): String {
        return when (prefix.lowercase()) {
            "apex" -> "illustrations/AP/AP_Exercice/APEX_$i.jpg"
            "aplt" -> "illustrations/AP/AP_Loisirs/APLT_$i.jpg"
            "apta" -> "illustrations/AP/AP_TransportsActifs/APTA_$i.jpg"
            "usac" -> "illustrations/POS/US_Accomplissement/USAC_$i.jpg"
            "usan" -> "illustrations/POS/US_Animaux/USAN_$i.jpg"
            "usna" -> "illustrations/POS/US_Nature/USNA_$i.jpg"
            "uspl" -> "illustrations/POS/US_Plaisir/USPL_$i.jpg"
            "usrs" -> "illustrations/POS/US_RelationSociale/USRS_$i.jpg"
            else -> "illustrations/AP/AP_Exercice/APEX_$i.jpg"
        }
    }

    private fun getRandomIllustrations(hiddenMap: Map<Int, Boolean>): Pair<SelectedImage, SelectedImage> {
        val sportPrefixes = listOf(
            Pair("apex", 33),
            Pair("aplt", 28),
            Pair("apta", 25)
        )

        val positivePrefixes = listOf(
            Pair("usac", 12),
            Pair("usan", 13),
            Pair("usna", 9),
            Pair("uspl", 17),
            Pair("usrs", 5)
        )

        val sportIllustrations = mutableListOf<SelectedImage>()
        var sportCount = 0
        for ((prefix, count) in sportPrefixes) {
            for (i in 1..count) {
                sportCount++
                val imageId = sportCount
                val isHidden = hiddenMap[imageId] ?: false
                if (!isHidden) {
                    val resId = resources.getIdentifier("${prefix}_$i", "drawable", packageName)
                    val relativePath = getRelativePath(prefix, i)
                    sportIllustrations.add(SelectedImage(resId = resId, index = imageId, relativePath = relativePath))
                }
            }
        }

        Log.d("ImagesActivity", "Sport illustrations count (hidden=false): ${sportIllustrations.size} / $sportCount")

        // Fallback if all sport images are marked as hidden
        if (sportIllustrations.isEmpty()) {
            Log.w("ImagesActivity", "All sport images are hidden! Falling back to all sport images.")
            sportCount = 0
            for ((prefix, count) in sportPrefixes) {
                for (i in 1..count) {
                    sportCount++
                    val imageId = sportCount
                    val resId = resources.getIdentifier("${prefix}_$i", "drawable", packageName)
                    val relativePath = getRelativePath(prefix, i)
                    sportIllustrations.add(SelectedImage(resId = resId, index = imageId, relativePath = relativePath))
                }
            }
        }

        val positiveIllustrations = mutableListOf<SelectedImage>()
        var posCount = 86
        for ((prefix, count) in positivePrefixes) {
            for (i in 1..count) {
                posCount++
                val imageId = posCount
                val isHidden = hiddenMap[imageId] ?: false
                if (!isHidden) {
                    val resId = resources.getIdentifier("${prefix}_$i", "drawable", packageName)
                    val relativePath = getRelativePath(prefix, i)
                    positiveIllustrations.add(SelectedImage(resId = resId, index = imageId, relativePath = relativePath))
                }
            }
        }

        Log.d("ImagesActivity", "Positive illustrations count (hidden=false): ${positiveIllustrations.size} / ${posCount - 86}")

        // Fallback if all positive images are marked as hidden
        if (positiveIllustrations.isEmpty()) {
            Log.w("ImagesActivity", "All positive images are hidden! Falling back to all positive images.")
            posCount = 86
            for ((prefix, count) in positivePrefixes) {
                for (i in 1..count) {
                    posCount++
                    val imageId = posCount
                    val resId = resources.getIdentifier("${prefix}_$i", "drawable", packageName)
                    val relativePath = getRelativePath(prefix, i)
                    positiveIllustrations.add(SelectedImage(resId = resId, index = imageId, relativePath = relativePath))
                }
            }
        }

        val selectedSport = sportIllustrations.random()
        val selectedPositive = positiveIllustrations.random()

        return Pair(selectedSport, selectedPositive)
    }

}

data class SelectedImage(
    val resId: Int,
    val index: Int,
    val relativePath: String
)

@Composable
fun StackedImages(
    topImageRes: Int,
    topBitmap: Bitmap?,
    bottomImageRes: Int,
    bottomBitmap: Bitmap?
) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.SpaceEvenly,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (topBitmap != null) {
            Image(
                bitmap = topBitmap.asImageBitmap(),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentDescription = "top_illustration",
            )
        } else {
            Image(
                painter = painterResource(topImageRes),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentDescription = "top_illustration",
            )
        }

        if (bottomBitmap != null) {
            Image(
                bitmap = bottomBitmap.asImageBitmap(),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentDescription = "bottom_illustration",
            )
        } else {
            Image(
                painter = painterResource(bottomImageRes),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentDescription = "bottom_illustration",
            )
        }
    }
}
