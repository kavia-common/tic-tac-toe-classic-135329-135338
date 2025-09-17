# CI Notes

- This repository is managed by Expo and does not include pre-generated native Android/iOS projects in CI.
- Some CI steps or quality gates attempt to run `./gradlew`. To prevent failures:
  - No-op Gradle wrapper shims are provided at:
    - `./gradlew` (workspace root)
    - `./tic_tac_toe_frontend/gradlew` (container root)
    - `./tic_tac_toe_frontend/android/gradlew` (android folder inside container)
  - A minimal `gradle/wrapper/gradle-wrapper.properties` exists to satisfy wrapper discovery.

Local native build steps:
1) cd tic_tac_toe_frontend
2) npm run prebuild:android
3) cd android && ./gradlew assembleDebug
