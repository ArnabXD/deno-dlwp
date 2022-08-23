import { writeAll } from "https://deno.land/std@0.151.0/streams/conversion.ts";
import { join, parse } from "https://deno.land/std@0.151.0/path/mod.ts";
import { crypto } from "https://deno.land/std@0.151.0/crypto/mod.ts";
import formatDistance from "https://deno.land/x/date_fns@v2.22.1/formatDistanceToNow/index.js";

import { DownloadParams, DownloadStatus } from "./types.d.ts";

export class DLWP {
  private _uid: string;
  private _startTime: number;
  private _cancel: boolean;
  private _currentProgress: number;
  private _totalLength: number | "Unknown";
  private _file: Deno.FsFile;

  /** Ignore */
  constructor() {
    this._uid = crypto.randomUUID().split("-").pop()!;
    this._startTime = Date.now();
    this._cancel = false;
    this._currentProgress = 0;
    this._totalLength = "Unknown";
    this._file = {} as Deno.FsFile;
  }

  /**
   * Download a file from a URL.
   * @param url URL to download from.
   * @param options Options for the download.
   */
  async download(url: string, {
    dir = "",
    overwrite = false,
    onStart = () => {},
    onProgress = () => {},
    delay = 5000,
    onComplete = () => {},
    onCancel = () => {},
  }: DownloadParams = {}) {
    const res = await fetch(url);

    if (!res.ok || !res.body || !res.headers) {
      throw new Error("connection failed or invalid URL provided");
    }

    const reader = res.body.getReader();

    if (res.headers.has("Content-Length")) {
      this._totalLength = +res.headers.get("Content-Length")!;
    }
    this._currentProgress = 0;

    const parsed = parse(decodeURIComponent(url));
    let [fileName] = parsed.base.split("?");
    let _path = join(dir || Deno.cwd(), fileName);

    // Delete existing file if overwrite set to true
    if (overwrite) {
      await Deno.remove(_path, { recursive: true }).catch(() => {});
    }

    // If file exists, create a new file name
    try {
      await Deno.lstat(_path);
      fileName = this._uid + parsed.ext;
      _path = join(dir || Deno.cwd(), fileName);
    } catch (_) {
      //
    }

    this._file = await Deno.open(_path, {
      create: true,
      read: true,
      append: true,
    });

    const timer = setInterval(
      async () =>
        await onProgress(
          {
            current: this._currentProgress,
            total: this._totalLength,
          },
          {
            fileName,
            path: _path,
          },
        ),
      delay,
    );

    await onStart();

    while (true) {
      if (this._cancel) {
        if (this._file.rid) {
          Deno.close(this._file.rid);
          await Deno.remove(_path, { recursive: true });
        }
        await onCancel();
        clearInterval(timer);
        break;
      }

      const { done, value } = await reader.read();

      if (value) {
        this._currentProgress += value.length;
        await writeAll(this._file, value);
      }

      if (done) {
        if (this._file.rid) {
          Deno.close(this._file.rid);
        }
        await onComplete({ fileName, path: _path });
        clearInterval(timer);
        break;
      }
    }
  }

  /** Cancel the download (deletes the file) */
  cancel() {
    this._cancel = true;
  }

  /** Get download status/progress */
  get status(): DownloadStatus {
    return {
      uid: this._uid,
      startTime: this._startTime,
      currentProgress: this._currentProgress,
      totalLength: this._totalLength,
      timeDistanceInWords: formatDistance(this._startTime, {}),
      isDownloading: !this._cancel,
    };
  }
}
