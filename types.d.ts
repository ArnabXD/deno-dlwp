export interface CallbackParamsProgress {
  /**
   * Current progress in bytes
   */
  current: number;
  /**
   * Total bytes to download
   */
  total: number | "Unknown";
}

export interface CallbackParamsFile {
  /**
   * Downloading as name
   */
  fileName: string;
  /**
   * Downloading to path
   */
  path: string;
}

export type OnProgressCallback = (
  progress: CallbackParamsProgress,
  file: CallbackParamsFile,
) => void | Promise<void>;

export type OnCompleteCallback = (
  file: CallbackParamsFile,
) => void | Promise<void>;

export interface DownloadParams {
  /**
   * Directory to download the file
   */
  dir?: string;
  /**
   * Overwrite or create new
   */
  overwrite?: boolean;
  /**
   * Callback to run on download start
   */
  onStart?: () => void | Promise<void>;
  /**
   * Callback to run on download progress
   */
  onProgress?: OnProgressCallback;
  /**
   * Time (ms) to trigger onProgress. Default `5000`
   */
  delay?: number;
  /**
   * Callback to run on download complete
   */
  onComplete?: OnCompleteCallback;
}
