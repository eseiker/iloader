<picture align="left" >
  <source media="(prefers-color-scheme: dark)" srcset="/iloader.svg">
  <img align="left" width="90" height="90" src="/iloader-dark.svg">
</picture>

<div id="user-content-toc">
  <ul style="list-style: none;">
    <summary>
      <h1>iloader</h1>
    </summary>
  </ul>
</div>

---

[![Build iloader](https://github.com/nab138/iloader/actions/workflows/build.yml/badge.svg)](https://github.com/nab138/iloader/actions/workflows/build.yml)

Install SideStore (or other apps) and import your pairing file with ease

<img width="1918" height="998" alt="iloader0" src="https://github.com/user-attachments/assets/93cd135d-6d89-46ee-9b9f-12c596806911" />

## How to use

- Install usbmuxd for your platform
  - Windows: [iTunes](https://apple.co/ms)
  - macOS: Included
  - Linux: Potentially included, if not, install via your package manager
- Install the latest version for your platform from the [releases](https://github.com/nab138/iloader/releases)
  - macOS: This app is unsigned and macOS may say it is "broken", you need to run `sudo xattr -c /Applications/iloader.app` to use it
- Plug in your iDevice to your computer
- Open the app
- Sign into your Apple ID
- Select your action (e.g. install SideStore)

## Features

- Install SideStore (or LiveContainer + SideStore) and place pairing file automatically
- Install other IPAs
- Manage pairing files in common apps like StikDebug, SideStore, Protokolle, etc
- See and revoke development certificates
- See App IDs
- Save multiple apple ID credentials

## Credits

- Icon made by [Transistor](https://github.com/transistor-exe)
- UI improved by [StephenDev0](https://github.com/StephenDev0)
- [idevice](https://github.com/jkcoxson/idevice) by [jkcoxson](https://github.com/jkcoxson) for communicating with iOS devices
- [isideload](https://github.com/nab138/isideload) for installing apps
- [idevice_pair](https://github.com/jkcoxson/idevice_pair) was used as a reference for pairing file management
- App made with [tauri](https://tauri.app)

## Future Plans

- Set a "default" account to automatically log into
- Import SideStore certificates/account info automatically
- Mount DDI and open sidestore after installation
