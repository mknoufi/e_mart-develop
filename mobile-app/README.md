# E Mart Mobile App

A comprehensive React Native mobile application for E Mart Electronics Store Management System, designed to work seamlessly with Frappe/ERPNext v15 backend.

## 🚀 Features

### **Core Functionality**
- **Authentication**: Secure login with biometric support
- **Dashboard**: Real-time statistics and quick actions
- **Series Management**: Generate and manage purchase series numbers
- **Purchase Management**: Create and manage purchase invoices
- **Sales Management**: Handle sales invoices and transactions
- **Inventory Management**: Track stock levels and items
- **Reports**: Generate and view business reports
- **QR Code Scanning**: Scan barcodes and QR codes
- **Camera Integration**: Take photos for documentation
- **Offline Support**: Work without internet connection
- **Push Notifications**: Real-time alerts and updates

### **Advanced Features**
- **Special Purchase Schemes**: Manage discount schemes
- **Real-time Sync**: Automatic data synchronization
- **File Upload**: Upload documents and images
- **User Management**: Profile and settings management
- **Multi-language Support**: Internationalization ready
- **Dark Mode**: Automatic theme switching
- **Accessibility**: Full accessibility compliance

## 📱 Screenshots

### Authentication
- Modern login screen with biometric support
- Secure registration process
- Password recovery functionality

### Dashboard
- Interactive statistics cards
- Quick action buttons
- Real-time charts and graphs
- Recent activity feed

### Series Management
- Normal and special series management
- Generate new series numbers
- Reset series functionality
- Detailed series information

### Purchase & Sales
- Create purchase invoices
- Manage sales transactions
- Item selection and pricing
- Document generation

## 🛠️ Technology Stack

### **Frontend**
- **React Native**: 0.72.6
- **React Navigation**: 6.x
- **React Native Paper**: Material Design components
- **React Native Elements**: UI component library
- **React Native Vector Icons**: Icon library

### **Charts & Visualization**
- **React Native Chart Kit**: Charts and graphs
- **React Native SVG**: SVG support

### **State Management**
- **React Context**: Global state management
- **AsyncStorage**: Local data persistence

### **Networking**
- **Axios**: HTTP client
- **React Native NetInfo**: Network status monitoring

### **Device Features**
- **React Native Camera**: Camera integration
- **React Native QR Code Scanner**: QR code scanning
- **React Native Biometrics**: Biometric authentication
- **React Native Push Notification**: Push notifications

### **File Management**
- **React Native FS**: File system operations
- **React Native Share**: File sharing
- **React Native Document Picker**: Document selection

## 📋 Prerequisites

### **Development Environment**
- Node.js >= 16
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- JDK 11 or higher

### **System Requirements**
- **Android**: API level 21+ (Android 5.0+)
- **iOS**: iOS 12.0+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB free space

## 🚀 Installation

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/e-mart-mobile.git
cd e-mart-mobile
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. iOS Setup (macOS only)**
```bash
cd ios
pod install
cd ..
```

### **4. Environment Configuration**
Create a `.env` file in the root directory:
```env
API_BASE_URL=https://your-erpnext-server.com
APP_ENV=development
```

### **5. Run the App**

#### **Android**
```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android
```

#### **iOS**
```bash
# Start Metro bundler
npm start

# Run on iOS simulator/device
npm run ios
```

## 🔧 Configuration

### **API Configuration**
Update `src/config/config.js`:
```javascript
export const API_BASE_URL = 'https://your-erpnext-server.com';
export const APP_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  offlineSyncInterval: 300000, // 5 minutes
};
```

### **Theme Configuration**
Customize the app theme in `src/theme/theme.js`:
```javascript
export const theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    // ... other colors
  },
  // ... other theme properties
};
```

## 📱 App Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Common UI components
│   │   ├── forms/          # Form components
│   │   └── charts/         # Chart components
│   ├── screens/            # App screens
│   │   ├── auth/           # Authentication screens
│   │   ├── dashboard/      # Dashboard screen
│   │   ├── series/         # Series management
│   │   ├── purchase/       # Purchase screens
│   │   ├── sales/          # Sales screens
│   │   ├── inventory/      # Inventory screens
│   │   ├── reports/        # Reports screens
│   │   ├── settings/       # Settings screens
│   │   ├── profile/        # Profile screens
│   │   ├── notifications/  # Notification screens
│   │   ├── scan/           # QR scanning screens
│   │   └── camera/         # Camera screens
│   ├── contexts/           # React contexts
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── theme/              # Theme configuration
│   └── config/             # App configuration
├── android/                # Android specific files
├── ios/                    # iOS specific files
├── assets/                 # Static assets
└── docs/                   # Documentation
```

## 🔌 API Integration

### **Frappe/ERPNext Backend**
The mobile app integrates with Frappe/ERPNext v15 through REST API endpoints:

#### **Authentication**
- `POST /api/method/login` - User login
- `POST /api/method/logout` - User logout

#### **Series Management**
- `GET /api/method/e_mart.api.get_series_data` - Get series data
- `POST /api/method/e_mart.api.generate_series` - Generate new series
- `POST /api/method/e_mart.api.reset_series` - Reset series

#### **Dashboard**
- `GET /api/method/e_mart.api.get_dashboard_data` - Get dashboard data

#### **Purchase Management**
- `GET /api/method/e_mart.api.get_purchase_invoices` - Get purchase invoices
- `POST /api/method/e_mart.api.create_purchase_invoice` - Create purchase invoice

#### **Sales Management**
- `GET /api/method/e_mart.api.get_sales_invoices` - Get sales invoices
- `POST /api/method/e_mart.api.create_sales_invoice` - Create sales invoice

## 🔐 Security Features

### **Authentication**
- JWT token-based authentication
- Biometric authentication support
- Secure token storage
- Automatic token refresh

### **Data Protection**
- Encrypted local storage
- Secure API communication (HTTPS)
- Input validation and sanitization
- SQL injection prevention

### **Privacy**
- GDPR compliance ready
- Data anonymization options
- User consent management
- Data retention policies

## 📊 Performance Optimization

### **App Performance**
- Lazy loading of components
- Image optimization and caching
- Efficient state management
- Memory leak prevention

### **Network Optimization**
- Request caching
- Offline data storage
- Background sync
- Compression and minification

### **Battery Optimization**
- Efficient background tasks
- Optimized location services
- Smart notification scheduling
- Power-aware operations

## 🧪 Testing

### **Unit Testing**
```bash
npm test
```

### **Integration Testing**
```bash
npm run test:integration
```

### **E2E Testing**
```bash
npm run test:e2e
```

### **Performance Testing**
```bash
npm run test:performance
```

## 📦 Building for Production

### **Android Build**
```bash
# Generate release APK
npm run build:android

# Generate release AAB
cd android && ./gradlew bundleRelease
```

### **iOS Build**
```bash
# Archive for App Store
npm run build:ios
```

## 🚀 Deployment

### **Android Deployment**
1. Generate signed APK/AAB
2. Upload to Google Play Console
3. Configure release settings
4. Publish to production

### **iOS Deployment**
1. Archive the app in Xcode
2. Upload to App Store Connect
3. Configure app metadata
4. Submit for review

## 🔄 CI/CD Pipeline

### **GitHub Actions**
```yaml
name: Build and Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## 📈 Analytics & Monitoring

### **Crash Reporting**
- Firebase Crashlytics integration
- Error tracking and reporting
- Performance monitoring

### **User Analytics**
- User behavior tracking
- Feature usage analytics
- Conversion tracking

## 🔧 Troubleshooting

### **Common Issues**

#### **Metro Bundler Issues**
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

#### **iOS Build Issues**
```bash
# Clean and rebuild
cd ios
rm -rf build
pod install
cd ..
npx react-native run-ios
```

#### **Android Build Issues**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### **Debug Mode**
```bash
# Enable debug mode
npx react-native run-android --variant=debug
npx react-native run-ios --configuration=Debug
```

## 📚 Documentation

### **API Documentation**
- [Frappe/ERPNext API Reference](https://frappeframework.com/docs/v14/user/en/api)
- [E Mart API Endpoints](./docs/api.md)

### **Component Documentation**
- [Component Library](./docs/components.md)
- [Theme System](./docs/theme.md)

### **Development Guide**
- [Development Setup](./docs/development.md)
- [Contributing Guidelines](./docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### **Code Style**
- Follow ESLint configuration
- Use Prettier for formatting
- Follow React Native best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- [Issues](https://github.com/your-username/e-mart-mobile/issues)
- [Discussions](https://github.com/your-username/e-mart-mobile/discussions)
- [Documentation](./docs)

### **Contact**
- Email: support@emart.com
- Discord: [E Mart Community](https://discord.gg/emart)

## 🙏 Acknowledgments

- Frappe Framework team for the excellent backend
- React Native community for the amazing ecosystem
- All contributors and maintainers

---

**E Mart Mobile App** - Modern, Secure, and Efficient Mobile Solution for Electronics Store Management 