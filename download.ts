import { writeAll } from "https://deno.land/std@0.151.0/streams/conversion.ts";
import { join, parse } from "https://deno.land/std@0.151.0/path/mod.ts";
import { crypto } from "https://deno.land/std@0.151.0/crypto/mod.ts";
import formatDistance from "https://deno.land/x/date_fns@v2.22.1/formatDistanceToNow/index.js";

import { DownloadParams, DownloadStatus } from "./types.d.ts";

export class DLWP {
  /** unique identifier */
  private _uid: string;
  /** starting time */
  private _startTime: number;
  /** triggered cancel */
  private _cancel = false;
  /** downloaded bytes */
  private _currentProgress = 0;
  /** total bytes to download */
  private _totalLength: number | "Unknown";
  private _file = {} as Deno.FsFile;
  /** progress callback timer */
  private _progressTimer = 0;
  /** speed and eta related timer */
  private _speedTimer = 0;
  /** prev bytes snap to calculate speed */
  private _prevBytes = 0;
  /** average speed in last 5 secs (in bytes) */
  private _speed = 0;
  /** File path */
  private _path = "";
  /** File name */
  private _fileName = "";

  /** Deno DLWP */
  constructor() {
    this._uid = crypto.randomUUID().split("-").pop()!;
    this._startTime = Date.now();
    this._cancel = false;
    this._totalLength = "Unknown";
  }

  /** UID */
  get id() {
    return this._uid;
  }

  /** Cleanup function when  */
  private async _cleanup(deleteFile = true) {
    if (this._file.rid) {
      Deno.close(this._file.rid);
    }
    if (deleteFile) {
      await Deno.remove(this._path, { recursive: true });
    }
    if (this._progressTimer) {
      clearInterval(this._progressTimer);
    }
    if (this._speedTimer) {
      clearInterval(this._speedTimer);
    }
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
    this._fileName = parsed.base.split("?")[0];
    this._path = join(dir || Deno.cwd(), this._fileName);

    // Delete existing file if overwrite set to true
    if (overwrite) {
      await Deno.remove(this._path, { recursive: true }).catch(() => {});
    }

    // If file exists, create a new file name
    try {
      await Deno.lstat(this._path);
      this._fileName = this._uid + parsed.ext;
      this._path = join(dir || Deno.cwd(), this._fileName);
    } catch (_) {
      //
    }

    this._file = await Deno.open(this._path, {
      create: true,
      read: true,
      append: true,
    });

    this._progressTimer = setInterval(
      async () =>
        await onProgress(
          {
            current: this._currentProgress,
            total: this._totalLength,
            speed: this._speed,
          },
          {
            fileName: this._fileName,
            path: this._path,
          },
        ),
      delay,
    );

    this._speedTimer = setInterval(() => {
      // Average speed over last 5 seconds
      this._speed = (this._currentProgress - this._prevBytes) / 5;
      this._prevBytes = this._currentProgress;
    }, 5000);

    await onStart();

    while (true) {
      if (this._cancel) {
        await this._cleanup();
        await onCancel();
        break;
      }

      const { done, value } = await reader.read();

      if (value) {
        this._currentProgress += value.length;
        await writeAll(this._file, value);
      }

      if (done) {
        await this._cleanup(false);
        await onComplete({ fileName: this._fileName, path: this._path });
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
      speed: this._speed,
    };
  }
}
