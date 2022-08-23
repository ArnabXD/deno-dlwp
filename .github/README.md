# Deno-DLWP

Download large files with progress

### Example

```ts
import { DLWP } from "https://deno.land/x/dlwp@v0.2.0/mod.ts";

const dlwp = new DLWP();
dlwp.download("https://speed.hetzner.de/1GB.bin", {
  onStart: () => {
    setTimeout(() => {
      console.log(dlwp.status);
      dlwp.cancel();
    }, 5000);
  },
});
```
