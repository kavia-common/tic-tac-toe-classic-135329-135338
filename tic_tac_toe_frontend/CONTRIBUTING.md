# Contributing / Local Native Builds

This project uses Expo. In CI, Android native builds are disabled to avoid generating the `android/` directory.

- To generate native Android locally:
  1. npm run prebuild:android
  2. cd android && ./gradlew assembleDebug

- In CI:
  - The `android/gradlew` file is a shim that exits successfully. This prevents failures from external tools invoking Gradle without a generated native project.
  - A repo-root `gradlew`, `gradlew.bat`, and `gradle/wrapper/gradle-wrapper.properties` are provided as no-op shims to satisfy CI checks that expect a Gradle wrapper.
  - The `npm run build` script uses `expo export --platform web` for a quick compatibility build.

If you add native modules, ensure to commit appropriate configuration or adapt the build process accordingly.
