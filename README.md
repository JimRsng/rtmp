# rtmp

A local RTMP + HLS server for JimRsng's streaming workspace.

It accepts an RTMP input, generates HLS output with FFmpeg, and serves media over HTTP.  
It also supports a development mode without Cloudflare Tunnel and token caching for production runs.

## Features

- RTMP ingest with FFmpeg processing
- HLS output served via HTTP
- WebSocket server to serve live data (viewer count, status) for web clients
- Auto-installs `cloudflared.exe` and `ffmpeg.exe` into `%LOCALAPPDATA%`
- `--dev` mode (no tunnel)
- Cloudflare token validation and cache
- Startup update check

## Requirements

- Node.js 22 or newer
- pnpm

## Quick Start

- Install dependencies

   ```bash
   pnpm install
   ```

- Run app

   ```bash
   # Dev mode (no tunnel)
   pnpm dev

   # or

   # Normal mode
   pnpm start
   ```

## Build and Compile

### Build

Creates the distributable JavaScript output in `dist/`.

```bash
pnpm build
```

### Compile (Windows executable)

Builds the project, packages it as a Windows `.exe`, and applies executable metadata.

```bash
pnpm compile
```

Output file:

- `pkg/jim-rtmp.exe`

> Current compile target: `node24-win-x64`.

## App usage

When the app starts for the first time, it asks for your Cloudflare Tunnel token.

1. Enter your token when prompted.
2. Choose whether to save it for future runs.
3. If saved, the app will use the cached token on next launches and will not ask again.
4. Then FFmpeg starts listening for RTMP and begins processing as soon as a stream is received.

![usage](https://github.com/user-attachments/assets/609cfc94-0700-49b3-9cd1-a1b6a45fed3e)

- RTMP served at `rtmp://127.0.0.1:5740/live`
- HTTP served at `http://127.0.0.1:8080/live`

## License

MIT. See [LICENSE](LICENSE).
