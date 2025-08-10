import 'dotenv/config';

export default {
  expo: {
    name: "MediTracker",
    slug: "meditracker-app",
    version: "1.0.0",
    sdkVersion: "53.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    android: {
      "jsEngine": "jsc",
      package: "com.swagat1212.meditrackerapp",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    extra: {
      eas: {
        projectId: "da10eca1-230a-40c7-8f4c-4bc8af7e5807",
      },
    },
  },
};
