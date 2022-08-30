export interface CallbackParamsProgress {
  /** Current progress in bytes */
  current: number;
  /** Total bytes to download */
  total: number | "Unknown";
  /** Average speed over las 5 secs */
  speed: number;
}

export interface CallbackParamsFile {
  /** Downloading as name */
  fileName: string;
  /** Downloading to path */
  path: string;
}

/** Progress callback */
export type OnProgressCallback = (
  progress: CallbackParamsProgress,
  file: CallbackParamsFile,
) => void | Promise<void>;

/** Download complete callback */
export type OnCompleteCallback = (
  file: CallbackParamsFile,
) => void | Promise<void>;

export interface DownloadParams {
  /** Directory to download the file */
  dir?: string;
  /** Overwrite or create new */
  overwrite?: boolean;
  /** Callback to run on download start */
  onStart?: () => void | Promise<void>;
  /** Callback to run on download progress */
  onProgress?: OnProgressCallback;
  /** Time (ms) to trigger onProgress. Default `5000` */
  delay?: number;
  /** Callback to run on download complete */
  onComplete?: OnCompleteCallback;
  /** Callback to run on Cancel */
  onCancel?: () => void | Promise<void>;
}

export interface DownloadStatus {
  /** Unique id */
  uid: string;
  /** Download started on */
  startTime: number;
  /** Current download progress */
  currentProgress: number;
  /** Total buffer size to be downloaded */
  totalLength: number | "Unknown";
  /** Time distance from startTime to now in words */
  timeDistanceInWords: string;
  /** Is it downloading */
  isDownloading: boolean;
  /** Average speed over last 5 secs */
  speed: number;
}
