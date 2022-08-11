# Deno-DLWP

Download large files with progress

### Documentation

```ts
async function download(
  url: string,
  { dir, overwrite, onStart, onProgress, delay, onComplete }: DownloadParams,
);
```

```
interface DownloadParams

  dir?: string
    Directory to download the file
  overwrite?: boolean
    Overwrite or create new
  onStart?: () => void | Promise<void>
    Callback to run on download start
  onProgress?: (progress: { current: number; total: number | "Unknown"; }, file: { fileName: string; path: string; }) => void | Promise<void>
    Callback to run on download progress
  delay?: number
    Time (ms) to trigger onProgress. Default `5000`
  onComplete?: (file: { fileName: string; path: string; }) => void | Promise<void>
    Callback to run on download complete
```

### Example

```ts
import { download } from "https://deno.land/x/dlwp@v0.1.2/mod.ts";

await download("https://speed.hetzner.de/100MB.bin", {
  onComplete: ({ fileName }) => console.log("Downloaded : " + fileName),
});
```
