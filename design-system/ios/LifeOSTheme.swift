/**
 * LifeOS Coach - SwiftUI Design Tokens
 * Version: 1.0
 * Generated from design_system.md
 */

import SwiftUI

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - LifeOS Theme
struct LifeOSTheme {
    
    // MARK: Brand Colors
    struct Brand {
        static let primary = Color(hex: "2D5A4A")
        static let secondary = Color(hex: "B8936A")
        static let accent = Color(hex: "4A9B7F")
    }
    
    // MARK: Semantic Colors
    struct Semantic {
        static let success = Color(hex: "34A853")
        static let warning = Color(hex: "F9A825")
        static let error = Color(hex: "D93025")
        static let info = Color(hex: "4285F4")
    }
    
    // MARK: Neutral Palette
    struct Neutral {
        static let n50 = Color(hex: "FAF9F7")   // Paper
        static let n100 = Color(hex: "F3F1ED")  // Canvas
        static let n200 = Color(hex: "E8E4DE")  // Linen
        static let n300 = Color(hex: "D4CFC6")  // Stone
        static let n400 = Color(hex: "A89F91")  // Driftwood
        static let n500 = Color(hex: "7D7468")  // Bark
        static let n600 = Color(hex: "5C554B")  // Earth
        static let n700 = Color(hex: "403B34")  // Charcoal
        static let n800 = Color(hex: "2A2722")  // Night
        static let n900 = Color(hex: "1A1815")  // Void
    }
    
    // MARK: Coach Category Colors
    struct CoachCategory {
        static let health = Color(hex: "34A853")
        static let healthLight = Color(hex: "81C784")
        static let wealth = Color(hex: "F9A825")
        static let wealthLight = Color(hex: "FFD54F")
        static let wisdom = Color(hex: "4285F4")
        static let wisdomLight = Color(hex: "90CAF9")
        static let career = Color(hex: "7B1FA2")
        static let careerLight = Color(hex: "BA68C8")
        static let relationships = Color(hex: "E91E63")
        static let relationshipsLight = Color(hex: "F48FB1")
        static let creativity = Color(hex: "FF5722")
        static let creativityLight = Color(hex: "FFAB91")
    }
    
    // MARK: PARA Category Colors
    struct PARA {
        static let project = Color(hex: "4285F4")
        static let area = Color(hex: "34A853")
        static let resource = Color(hex: "F9A825")
        static let archive = Color(hex: "A89F91")
    }
    
    // MARK: Memory Tier Colors
    struct MemoryTier {
        static let hot = Color(hex: "D93025")
        static let warm = Color(hex: "F9A825")
        static let cold = Color(hex: "A89F91")
    }
    
    // MARK: Spacing
    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
        static let xxxl: CGFloat = 64
    }
    
    // MARK: Border Radius
    struct Radius {
        static let none: CGFloat = 0
        static let sm: CGFloat = 4
        static let md: CGFloat = 8
        static let lg: CGFloat = 12
        static let xl: CGFloat = 16
        static let xxl: CGFloat = 24
        static let full: CGFloat = 9999
    }
    
    // MARK: Typography
    struct Typography {
        static let displayFont = Font.custom("Outfit", size: 48).weight(.bold)
        static let h1 = Font.custom("Outfit", size: 36).weight(.semibold)
        static let h2 = Font.custom("Outfit", size: 24).weight(.semibold)
        static let h3 = Font.custom("Outfit", size: 20).weight(.medium)
        static let body = Font.custom("Inter", size: 16)
        static let bodySmall = Font.custom("Inter", size: 14)
        static let caption = Font.custom("Inter", size: 12)
        static let button = Font.custom("Inter", size: 14).weight(.medium)
        static let mono = Font.custom("JetBrains Mono", size: 13)
        
        // Fallback to system fonts
        static let displayFallback = Font.system(size: 48, weight: .bold)
        static let h1Fallback = Font.system(size: 36, weight: .semibold)
        static let h2Fallback = Font.system(size: 24, weight: .semibold)
        static let h3Fallback = Font.system(size: 20, weight: .medium)
        static let bodyFallback = Font.system(size: 16)
    }
    
    // MARK: Shadows
    struct Shadow {
        static let sm = ShadowConfig(color: .black.opacity(0.05), radius: 1, x: 0, y: 1)
        static let md = ShadowConfig(color: .black.opacity(0.07), radius: 3, x: 0, y: 4)
        static let lg = ShadowConfig(color: .black.opacity(0.08), radius: 8, x: 0, y: 10)
        static let xl = ShadowConfig(color: .black.opacity(0.1), radius: 15, x: 0, y: 20)
    }
    
    // MARK: Animation
    struct Animation {
        static let fast = SwiftUI.Animation.easeOut(duration: 0.15)
        static let normal = SwiftUI.Animation.easeOut(duration: 0.2)
        static let slow = SwiftUI.Animation.easeOut(duration: 0.3)
        static let bounce = SwiftUI.Animation.spring(response: 0.4, dampingFraction: 0.6)
    }
    
    // MARK: Component Sizes
    struct ComponentSize {
        static let buttonSmall: CGFloat = 32
        static let buttonMedium: CGFloat = 40
        static let buttonLarge: CGFloat = 48
        static let inputHeight: CGFloat = 44
        static let navHeight: CGFloat = 64
        static let headerHeight: CGFloat = 56
        static let touchTarget: CGFloat = 44
    }
}

// MARK: - Shadow Config Helper
struct ShadowConfig {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
}

// MARK: - View Extension for Shadows
extension View {
    func lifeOSShadow(_ config: ShadowConfig) -> some View {
        self.shadow(color: config.color, radius: config.radius, x: config.x, y: config.y)
    }
}

// MARK: - Button Styles
struct LifeOSPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(LifeOSTheme.Typography.button)
            .foregroundColor(.white)
            .padding(.horizontal, LifeOSTheme.Spacing.lg)
            .padding(.vertical, LifeOSTheme.Spacing.md)
            .background(LifeOSTheme.Brand.primary)
            .cornerRadius(LifeOSTheme.Radius.md)
            .lifeOSShadow(LifeOSTheme.Shadow.sm)
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(LifeOSTheme.Animation.fast, value: configuration.isPressed)
    }
}

struct LifeOSSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(LifeOSTheme.Typography.button)
            .foregroundColor(LifeOSTheme.Neutral.n700)
            .padding(.horizontal, LifeOSTheme.Spacing.lg)
            .padding(.vertical, LifeOSTheme.Spacing.md)
            .background(Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: LifeOSTheme.Radius.md)
                    .stroke(LifeOSTheme.Neutral.n300, lineWidth: 1.5)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(LifeOSTheme.Animation.fast, value: configuration.isPressed)
    }
}

// MARK: - Preview
#if DEBUG
struct LifeOSTheme_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 20) {
            Text("LifeOS Coach")
                .font(LifeOSTheme.Typography.h1Fallback)
                .foregroundColor(LifeOSTheme.Brand.primary)
            
            Button("Primary Button") {}
                .buttonStyle(LifeOSPrimaryButtonStyle())
            
            Button("Secondary Button") {}
                .buttonStyle(LifeOSSecondaryButtonStyle())
            
            HStack(spacing: 8) {
                Circle().fill(LifeOSTheme.CoachCategory.health).frame(width: 32, height: 32)
                Circle().fill(LifeOSTheme.CoachCategory.wealth).frame(width: 32, height: 32)
                Circle().fill(LifeOSTheme.CoachCategory.wisdom).frame(width: 32, height: 32)
                Circle().fill(LifeOSTheme.CoachCategory.career).frame(width: 32, height: 32)
            }
        }
        .padding()
    }
}
#endif
