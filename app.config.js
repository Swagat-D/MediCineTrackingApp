import 'dotenv/config';

export default {
  expo: {
    name: "MediTracker",
    slug: "meditracker-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "medicinetrackingapp",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.swagat1212.meditrackerapp",
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "single", 
      favicon: "./assets/images/logo.png"
    },
    plugins: [
      "expo-splash-screen",
      "expo-font",
      "expo-camera",
      "expo-location",
      "expo-notifications",
      [
        "expo-media-library",
        {
          "photosPermission": "Allow MediTracker to access your photos to save barcodes.",
          "savePhotosPermission": "Allow MediTracker to save barcodes to your photo library.",
          "isAccessMediaLocationEnabled": true
        }
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: "35.0.0",
            minSdkVersion: 24,
            enableProguardInReleaseBuilds: false,
            enableShrinkResourcesInReleaseBuilds: false
          }
        }
      ],
    ],
    assetBundlePatterns: [
      "assets/**/*"
    ],
    experiments: {
      typedRoutes: true 
    },
    extra: {
      eas: {
        projectId: "da10eca1-230a-40c7-8f4c-4bc8af7e5807",
      },
    },
  },
};