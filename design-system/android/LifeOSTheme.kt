/**
 * LifeOS Coach - Jetpack Compose Design Tokens
 * Version: 1.0
 * Generated from design_system.md
 */

package com.lifeos.coach.ui.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ============================================
// COLORS
// ============================================

object LifeOSColors {
    // Brand Colors
    val Primary = Color(0xFF2D5A4A)
    val Secondary = Color(0xFFB8936A)
    val Accent = Color(0xFF4A9B7F)
    
    // Semantic Colors
    val Success = Color(0xFF34A853)
    val Warning = Color(0xFFF9A825)
    val Error = Color(0xFFD93025)
    val Info = Color(0xFF4285F4)
    
    // Neutral Palette (Warm)
    val Neutral50 = Color(0xFFFAF9F7)   // Paper
    val Neutral100 = Color(0xFFF3F1ED)  // Canvas
    val Neutral200 = Color(0xFFE8E4DE)  // Linen
    val Neutral300 = Color(0xFFD4CFC6)  // Stone
    val Neutral400 = Color(0xFFA89F91)  // Driftwood
    val Neutral500 = Color(0xFF7D7468)  // Bark
    val Neutral600 = Color(0xFF5C554B)  // Earth
    val Neutral700 = Color(0xFF403B34)  // Charcoal
    val Neutral800 = Color(0xFF2A2722)  // Night
    val Neutral900 = Color(0xFF1A1815)  // Void
    
    // Coach Category Colors
    object Coach {
        val Health = Color(0xFF34A853)
        val HealthLight = Color(0xFF81C784)
        val Wealth = Color(0xFFF9A825)
        val WealthLight = Color(0xFFFFD54F)
        val Wisdom = Color(0xFF4285F4)
        val WisdomLight = Color(0xFF90CAF9)
        val Career = Color(0xFF7B1FA2)
        val CareerLight = Color(0xFFBA68C8)
        val Relationships = Color(0xFFE91E63)
        val RelationshipsLight = Color(0xFFF48FB1)
        val Creativity = Color(0xFFFF5722)
        val CreativityLight = Color(0xFFFFAB91)
    }
    
    // PARA Category Colors
    object PARA {
        val Project = Color(0xFF4285F4)
        val Area = Color(0xFF34A853)
        val Resource = Color(0xFFF9A825)
        val Archive = Color(0xFFA89F91)
    }
    
    // Memory Tier Colors
    object Memory {
        val Hot = Color(0xFFD93025)
        val HotBackground = Color(0x1AD93025)
        val Warm = Color(0xFFF9A825)
        val WarmBackground = Color(0x1AF9A825)
        val Cold = Color(0xFFA89F91)
        val ColdBackground = Color(0x26A89F91)
    }
    
    // Dark Theme Adjustments
    val PrimaryDark = Color(0xFF4A9B7F)
    val SecondaryDark = Color(0xFFD4A574)
}

// Light Color Scheme
val LifeOSLightColorScheme = lightColorScheme(
    primary = LifeOSColors.Primary,
    secondary = LifeOSColors.Secondary,
    tertiary = LifeOSColors.Accent,
    background = LifeOSColors.Neutral50,
    surface = Color.White,
    error = LifeOSColors.Error,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = LifeOSColors.Neutral800,
    onSurface = LifeOSColors.Neutral800,
    onError = Color.White,
    outline = LifeOSColors.Neutral300,
    surfaceVariant = LifeOSColors.Neutral100,
)

// Dark Color Scheme
val LifeOSDarkColorScheme = darkColorScheme(
    primary = LifeOSColors.PrimaryDark,
    secondary = LifeOSColors.SecondaryDark,
    tertiary = LifeOSColors.Accent,
    background = LifeOSColors.Neutral900,
    surface = LifeOSColors.Neutral800,
    error = LifeOSColors.Error,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = LifeOSColors.Neutral50,
    onSurface = LifeOSColors.Neutral50,
    onError = Color.White,
    outline = LifeOSColors.Neutral700,
    surfaceVariant = LifeOSColors.Neutral700,
)

// ============================================
// SPACING
// ============================================

object LifeOSSpacing {
    val XS: Dp = 4.dp
    val SM: Dp = 8.dp
    val MD: Dp = 16.dp
    val LG: Dp = 24.dp
    val XL: Dp = 32.dp
    val XXL: Dp = 48.dp
    val XXXL: Dp = 64.dp
}

// ============================================
// BORDER RADIUS
// ============================================

object LifeOSRadius {
    val None = RoundedCornerShape(0.dp)
    val SM = RoundedCornerShape(4.dp)
    val MD = RoundedCornerShape(8.dp)
    val LG = RoundedCornerShape(12.dp)
    val XL = RoundedCornerShape(16.dp)
    val XXL = RoundedCornerShape(24.dp)
    val Full = RoundedCornerShape(50)
}

// ============================================
// TYPOGRAPHY
// ============================================

// Note: Add Outfit and Inter fonts to res/font/
// For now, using defaults with proper weights
val OutfitFontFamily = FontFamily.Default // Replace with Font(R.font.outfit_*)
val InterFontFamily = FontFamily.Default  // Replace with Font(R.font.inter_*)
val JetBrainsMonoFamily = FontFamily.Monospace

object LifeOSTypography {
    val Display = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 48.sp,
        lineHeight = 52.sp
    )
    
    val H1 = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 36.sp,
        lineHeight = 43.sp
    )
    
    val H2 = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        lineHeight = 31.sp
    )
    
    val H3 = TextStyle(
        fontFamily = OutfitFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 20.sp,
        lineHeight = 27.sp
    )
    
    val Body = TextStyle(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp
    )
    
    val BodySmall = TextStyle(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 21.sp
    )
    
    val Caption = TextStyle(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 17.sp
    )
    
    val Button = TextStyle(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 14.sp
    )
    
    val Mono = TextStyle(
        fontFamily = JetBrainsMonoFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        lineHeight = 21.sp
    )
}

// ============================================
// ANIMATION
// ============================================

object LifeOSAnimation {
    // Easing
    val EaseDefault = CubicBezierEasing(0.4f, 0f, 0.2f, 1f)
    val EaseIn = CubicBezierEasing(0.4f, 0f, 1f, 1f)
    val EaseOut = CubicBezierEasing(0f, 0f, 0.2f, 1f)
    val EaseBounce = CubicBezierEasing(0.34f, 1.56f, 0.64f, 1f)
    val EaseSpring = CubicBezierEasing(0.175f, 0.885f, 0.32f, 1.275f)
    
    // Durations
    const val DurationInstant = 75
    const val DurationFast = 150
    const val DurationNormal = 200
    const val DurationSlow = 300
    const val DurationSlower = 500
    
    // Pre-built specs
    fun <T> fast() = tween<T>(DurationFast, easing = EaseDefault)
    fun <T> normal() = tween<T>(DurationNormal, easing = EaseDefault)
    fun <T> slow() = tween<T>(DurationSlow, easing = EaseDefault)
}

// ============================================
// COMPONENT SIZES
// ============================================

object LifeOSComponentSize {
    val ButtonSmall: Dp = 32.dp
    val ButtonMedium: Dp = 40.dp
    val ButtonLarge: Dp = 48.dp
    val InputHeight: Dp = 44.dp
    val NavHeight: Dp = 64.dp
    val HeaderHeight: Dp = 56.dp
    val TouchTarget: Dp = 48.dp  // Android minimum is 48dp
}

// ============================================
// THEME COMPOSABLE
// ============================================

@Composable
fun LifeOSTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        LifeOSDarkColorScheme
    } else {
        LifeOSLightColorScheme
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
