# Changelog


## v0.0.8

[compare changes](https://github.com/JimRsng/rtmp/compare/v0.0.7...v0.0.8)

### 🚀 Enhancements

- Add dev mode without cloudflare tunnel ([c682873](https://github.com/JimRsng/rtmp/commit/c682873))

### ❤️ Contributors

- Ahmed Rangel ([@ahmedrangel](https://github.com/ahmedrangel))

## v0.0.7

[compare changes](https://github.com/JimRsng/rtmp/compare/v0.0.6...v0.0.7)

### 🚀 Enhancements

- Add multi-quality HLS master playlist output ([81e8697](https://github.com/JimRsng/rtmp/commit/81e8697))

### 🩹 Fixes

- Uncomment cloudflared tunnel spawn ([efea45a](https://github.com/JimRsng/rtmp/commit/efea45a))
- Improve player with list size 1 and remove epoch hls start number ([d587e26](https://github.com/JimRsng/rtmp/commit/d587e26))

### 🏡 Chore

- Lint ([1d6c7b6](https://github.com/JimRsng/rtmp/commit/1d6c7b6))
- Use epoch HLS sequence and silence FFmpeg stderr ([1f5770a](https://github.com/JimRsng/rtmp/commit/1f5770a))
- Use 1-digit HLS segment numbering ([3b7bd61](https://github.com/JimRsng/rtmp/commit/3b7bd61))

### 🤖 CI

- **release:** Use github release script with env set ([a9399a4](https://github.com/JimRsng/rtmp/commit/a9399a4))

### ❤️ Contributors

- Ahmed Rangel ([@ahmedrangel](https://github.com/ahmedrangel))
- Yizack Rangel ([@Yizack](https://github.com/Yizack))

## v0.0.6

[compare changes](https://github.com/JimRsng/rtmp/compare/v0.0.5...v0.0.6)

### 📦 Build

- **compile:** Remove sea mode ([9f8a48c](https://github.com/JimRsng/rtmp/commit/9f8a48c))

### 🏡 Chore

- Update pnpm ([0918b43](https://github.com/JimRsng/rtmp/commit/0918b43))

### ❤️ Contributors

- Yizack Rangel ([@Yizack](https://github.com/Yizack))

## v0.0.5

[compare changes](https://github.com/JimRsng/rtmp/compare/v0.0.4...v0.0.5)

### 🤖 CI

- **release:** Revert publish order ([aae32eb](https://github.com/JimRsng/rtmp/commit/aae32eb))

### ❤️ Contributors

- Yizack Rangel ([@Yizack](https://github.com/Yizack))

## v0.0.4

[compare changes](https://github.com/JimRsng/rtmp/compare/v0.0.3...v0.0.4)

### 🚀 Enhancements

- Make http and rtmp ports in-method configurable ([fa7edfb](https://github.com/JimRsng/rtmp/commit/fa7edfb))

### 🩹 Fixes

- Close interface on empty prompt ([248bd32](https://github.com/JimRsng/rtmp/commit/248bd32))

### 💅 Refactors

- **rtmp:** Unify dir setup and platform handling ([dac58ba](https://github.com/JimRsng/rtmp/commit/dac58ba))

### 📦 Build

- **compile:** Simplify pkg script ([27fcfca](https://github.com/JimRsng/rtmp/commit/27fcfca))
- **compile:** Pkg on sea mode ([2f5cbd8](https://github.com/JimRsng/rtmp/commit/2f5cbd8))

### 🏡 Chore

- Early return main run ([03b6a61](https://github.com/JimRsng/rtmp/commit/03b6a61))

### 🤖 CI

- **release:** Publish as draft to enable release immutability ([4a38127](https://github.com/JimRsng/rtmp/commit/4a38127))
- Add GitHub workflows and checks ([974ff75](https://github.com/JimRsng/rtmp/commit/974ff75))
- **release:** Fail on unmatched files ([577a7e2](https://github.com/JimRsng/rtmp/commit/577a7e2))

### ❤️ Contributors

- Yizack Rangel ([@Yizack](https://github.com/Yizack))

## v0.0.3

[compare changes](https://github.com/JimRsng/rtmp/compare/v0.0.2...v0.0.3)

### 🔥 Performance

- Improve latency + add logs ([cfecf1a](https://github.com/JimRsng/rtmp/commit/cfecf1a))

### 🩹 Fixes

- JSON import assertion and startup log ([734445e](https://github.com/JimRsng/rtmp/commit/734445e))

### 🏡 Chore

- Sync version ([eb2fc54](https://github.com/JimRsng/rtmp/commit/eb2fc54))

### 🤖 CI

- **release:** Automate release workflow ([b460a19](https://github.com/JimRsng/rtmp/commit/b460a19))

### ❤️ Contributors

- Yizack Rangel ([@Yizack](https://github.com/Yizack))
- Ahmed Rangel ([@ahmedrangel](https://github.com/ahmedrangel))

## v0.0.2


### 💅 Refactors

- Prefer named imports and helpers ([d713d64](https://github.com/JimRsng/rtmp/commit/d713d64))
- Use async mkdir from fs/promises ([6570a2f](https://github.com/JimRsng/rtmp/commit/6570a2f))
- Split rtmp and http + use ffmpeg for hls streaming ([4247033](https://github.com/JimRsng/rtmp/commit/4247033))
- Use package version and name ([5faa826](https://github.com/JimRsng/rtmp/commit/5faa826))

### 📖 Documentation

- Add readme ([8fbaa90](https://github.com/JimRsng/rtmp/commit/8fbaa90))
- Add MIT License to the project ([807c3cf](https://github.com/JimRsng/rtmp/commit/807c3cf))

### 📦 Build

- Migrate to obuild ([ba5abe5](https://github.com/JimRsng/rtmp/commit/ba5abe5))
- No need for dts ([849bb7b](https://github.com/JimRsng/rtmp/commit/849bb7b))

### 🏡 Chore

- Ignore pkg dir ([c2ad5b1](https://github.com/JimRsng/rtmp/commit/c2ad5b1))
- **types:** Update tsconfig ([482bf60](https://github.com/JimRsng/rtmp/commit/482bf60))
- Migrate to oxlint ([3812bf0](https://github.com/JimRsng/rtmp/commit/3812bf0))
- Update typescript ([13f2202](https://github.com/JimRsng/rtmp/commit/13f2202))
- Remove bind prop ([5a5478a](https://github.com/JimRsng/rtmp/commit/5a5478a))
- Explicit ext for node run ([8a5419d](https://github.com/JimRsng/rtmp/commit/8a5419d))
- Add package.json info ([c016da5](https://github.com/JimRsng/rtmp/commit/c016da5))
- Add release workflow and changelog tooling ([009c44c](https://github.com/JimRsng/rtmp/commit/009c44c))

### ❤️ Contributors

- Yizack Rangel ([@Yizack](https://github.com/Yizack))
- Ahmed Rangel ([@ahmedrangel](https://github.com/ahmedrangel))

