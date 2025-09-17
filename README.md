# Tic Tac Toe Classic (React Native)

A mobile app that allows users to play the classic Tic Tac Toe game.

- Ocean Professional theme (blue primary, amber secondary)
- Modern minimalist design with rounded corners and subtle shadows
- Play against another human or an AI
- Status display above the board, controls below

## Quick Start

- Install dependencies: npm install
- Start (Expo): npm start
- Run on Android emulator: npm run android
- Run on iOS simulator: npm run ios

## Build

- CI/web build: npm run build (exports a web build for CI checks)
- NOTE: Some CI providers invoke ./gradlew at repo root; this repo includes a no-op shim to prevent failures when native projects are not generated.
- Local Android native build:
  1) npm run prebuild:android
  2) cd android && ./gradlew assembleDebug

## Features

- 3x3 board with smooth interactions and subtle animations
- Game state management with win/draw detection
- Reset and New Game controls
- Mode toggle between 2 Players and Vs AI
- Basic AI: win > block > center > corner > side

## Project Structure (Container)
- App.tsx: Entire UI, theme, logic, and components (Board, Cell, Controls)
- index.ts: Expo root registration
- app.json: App metadata and theme hints
- assets/: Icons and splash

## Notes

- No environment variables are required.
- The app uses Expo 53 and React Native 0.79.

Enjoy your game!