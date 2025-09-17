@ECHO OFF
ECHO Gradle build is disabled in CI for this Expo-managed project.
ECHO To generate native Android locally, run:
ECHO   cd tic_tac_toe_frontend && expo prebuild --platform android
ECHO then run the Gradle task from the generated .\android directory.
EXIT /B 0
