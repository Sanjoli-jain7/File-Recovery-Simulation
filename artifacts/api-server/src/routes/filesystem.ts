import { Router, type IRouter } from "express";
import { getFilesystem } from "../lib/filesystem";
import {
  CreateFileBody,
  DeleteFileParams,
  AccessFileBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/filesystem", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  res.json(fs.getFilesystemState());
});

router.post("/filesystem/reset", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  res.json(fs.reset());
});

router.post("/filesystem/files", async (req, res): Promise<void> => {
  const parsed = CreateFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const fs = getFilesystem();
  const { name, parentId, type, fileType, size } = parsed.data;

  try {
    const node = fs.createFile(
      name,
      (type as "file" | "directory") || "file",
      fileType || "txt",
      size || 512,
      parentId ?? null
    );
    res.status(201).json(node);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});

router.delete("/filesystem/files/:id", async (req, res): Promise<void> => {
  const params = DeleteFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const fs = getFilesystem();
  try {
    fs.deleteFile(params.data.id);
    res.json(fs.getFilesystemState());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(404).json({ error: message });
  }
});

router.post("/filesystem/access", async (req, res): Promise<void> => {
  const parsed = AccessFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const fs = getFilesystem();
  try {
    const result = fs.accessFile(parsed.data.fileId, parsed.data.method, parsed.data.operation);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(404).json({ error: message });
  }
});

router.get("/filesystem/blocks", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  res.json(fs.getDiskBlocksState());
});

export default router;
