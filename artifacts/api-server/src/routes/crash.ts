import { Router, type IRouter } from "express";
import { getFilesystem } from "../lib/filesystem";
import { CorruptFileBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/crash/simulate", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  const result = fs.simulateCrash();
  res.json(result);
});

router.post("/crash/corrupt", async (req, res): Promise<void> => {
  const parsed = CorruptFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const fs = getFilesystem();
  try {
    const state = fs.corruptFile(parsed.data.fileId);
    res.json(state);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(404).json({ error: message });
  }
});

export default router;
