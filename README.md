# Deno-DLWP

Download large files with progress

### Documentation

```ts
async function download(
  url: string,
  { dir, overwrite, onStart, onProgress, delay, onComplete }: DownloadParams,
);
```

```text
// Defined in /types.d.ts:12:0

interface CallbackParamsFile

  fileName: string
    Downloading as name
  path: string
    Downloading to path

// Defined in /types.d.ts:1:0

interface CallbackParamsProgress

  current: number
    Current progress in bytes
  total: number | "Unknown"
    Total bytes to download

// Defined in /types.d.ts:32:0

interface DownloadParams

  dir?: string
    Directory to download the file
  overwrite?: boolean
    Overwrite or create new
  onStart?: () => void | Promise<void>
    Callback to run on download start
  onProgress?: OnProgressCallback
    Callback to run on download progress
  delay?: number
    Time (ms) to trigger onProgress. Default `5000`
  onComplete?: OnCompleteCallback
    Callback to run on download complete

// Defined in /types.d.ts:28:0

type OnCompleteCallback = (file: CallbackParamsFile) => void | Promise<void>

// Defined in /types.d.ts:23:0

type OnProgressCallback = (progress: CallbackParamsProgress, file: CallbackParamsFile) => void | Promise<void>
```

### Example

```ts
import { download } from "https://deno.land/x/dlwp@v0.1.2/mod.ts";

await download("https://speed.hetzner.de/100MB.bin", {
  onComplete: ({ fileName }) => console.log("Downloaded : " + fileName),
});
```
