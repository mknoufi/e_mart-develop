#!/bin/bash

# Mobile App Dependency Upgrade Helper
# This script helps plan and execute React Native dependency upgrades safely

set -e

echo "🔍 E-Mart Mobile App Dependency Upgrade Helper"
echo "=============================================="
echo ""

MOBILE_DIR="mobile-app"

if [ ! -d "$MOBILE_DIR" ]; then
    echo "❌ Mobile app directory not found: $MOBILE_DIR"
    exit 1
fi

cd "$MOBILE_DIR"

echo "📊 Current React Native Version Check"
echo "-------------------------------------"
if [ -f "package.json" ]; then
    CURRENT_RN=$(grep -o '"react-native": "[^"]*"' package.json | cut -d'"' -f4)
    echo "Current React Native: $CURRENT_RN"
    echo "Latest Available: 0.81.4"
    echo ""
else
    echo "❌ package.json not found in mobile-app directory"
    exit 1
fi

echo "🚨 IMPORTANT: React Native Upgrade Considerations"
echo "------------------------------------------------"
echo "• React Native 0.73.4 → 0.81.4 is a MAJOR upgrade"
echo "• Recommended approach: Incremental upgrades (0.74 → 0.75 → 0.76 → etc.)"
echo "• New Architecture changes may affect native modules"
echo "• Thorough testing required on both iOS and Android"
echo ""

echo "🔒 Security-Priority Package Updates"
echo "------------------------------------"
echo "react-native-keychain: 8.2.0 → 10.0.0 (Biometric security)"
echo "react-native-permissions: 4.1.5 → 5.4.2 (Privacy permissions)"
echo "react-native-device-info: 10.14.0 → 14.0.4 (Device security)"
echo ""

echo "📱 Navigation Updates (Breaking Changes)"
echo "----------------------------------------"
echo "@react-navigation/native: 6.1.18 → 7.1.17 (Breaking changes)"
echo "react-native-screens: 3.37.0 → 4.16.0 (Performance)"
echo ""

echo "🛠️ Next Steps"
echo "-------------"
echo "1. Backup current mobile app code"
echo "2. Create feature branch for upgrades"
echo "3. Start with security-critical packages first"
echo "4. Test thoroughly on both platforms"
echo "5. Plan React Native upgrade for separate sprint"
echo ""

echo "💡 Quick Commands"
echo "----------------"
echo "# Check for security vulnerabilities:"
echo "npm audit"
echo ""
echo "# Check for outdated packages:"
echo "npm outdated"
echo ""
echo "# Create package-lock.json for security audit:"
echo "npm i --package-lock-only"
echo ""

echo "✅ For immediate security improvements, focus on:"
echo "  - react-native-keychain"
echo "  - react-native-permissions" 
echo "  - react-native-device-info"
echo ""
echo "⚠️  Plan React Native core upgrade as separate project"
echo "   due to complexity and breaking changes."