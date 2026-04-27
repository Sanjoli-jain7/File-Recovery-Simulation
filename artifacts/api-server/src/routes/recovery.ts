import { Router, type IRouter } from "express";
import { getFilesystem } from "../lib/filesystem";
import { RecoverFilesBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/recovery/recover", async (req, res): Promise<void> => {
  const parsed = RecoverFilesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const fs = getFilesystem();
  const result = fs.recoverFiles(parsed.data.method, parsed.data.targetIds);
  res.json(result);
});

router.get("/recovery/logs", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  res.json(fs.getRecoveryLogs());
});

export default router;
