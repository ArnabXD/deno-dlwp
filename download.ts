import { writeAll } from "https://deno.land/std@0.151.0/streams/conversion.ts";
import { join, parse } from "https://deno.land/std@0.151.0/path/mod.ts";
import { crypto } from "https://deno.land/std@0.151.0/crypto/mod.ts";

import { DownloadParams } from "./types.d.ts";

export async function download(
  /**
   * URL/URI to download from.
   */
  url: string,
  {
    dir = "",
    overwrite = false,
    onStart = () => {},
    onProgress = () => {},
    delay = 5000,
    onComplete = () => {},
  }: DownloadParams,
) {
  const res = await fetch(url);

  if (!res.ok || !res.body || !res.headers) {
    throw new Error("connection failed or invalid URL provided");
  }

  const reader = res.body.getReader();
  const totalLength = +res.headers.get("Content-Length")! || "Unknown";
  let downloadedLength = 0;

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
    fileName = crypto.randomUUID().split("-").pop()! + parsed.ext;
    _path = join(dir || Deno.cwd(), fileName);
  } catch (_) {
    //
  }

  const file = await Deno.open(_path, {
    create: true,
    read: true,
    append: true,
  });

  const timer = setInterval(
    async () =>
      await onProgress(
        {
          current: downloadedLength,
          total: totalLength,
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
    const { done, value } = await reader.read();

    if (value) {
      downloadedLength += value.length;
      await writeAll(file, value);
    }

    if (done) {
      if (file.rid) {
        Deno.close(file.rid);
      }
      await onComplete({ fileName, path: _path });
      clearInterval(timer);
      break;
    }
  }
}
