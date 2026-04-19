import { Router, type IRouter } from "express";
import { getFilesystem } from "../lib/filesystem";

const router: IRouter = Router();

router.post("/optimization/defragment", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  const result = fs.defragment();
  res.json(result);
});

router.post("/optimization/reallocate", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  const result = fs.reallocate();
  res.json(result);
});

export default router;
