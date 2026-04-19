import { Router, type IRouter } from "express";
import { getFilesystem } from "../lib/filesystem";

const router: IRouter = Router();

router.get("/stats/dashboard", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  res.json(fs.getDashboardStats());
});

router.get("/stats/activity", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  res.json(fs.getActivityLog());
});

router.get("/stats/performance", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  res.json(fs.getPerformanceHistory());
});

router.get("/stats/report", async (_req, res): Promise<void> => {
  const fs = getFilesystem();
  const report = {
    generatedAt: new Date().toISOString(),
    filesystem: fs.getFilesystemState(),
    stats: fs.getDashboardStats(),
    activityLog: fs.getActivityLog(),
    recoveryLogs: fs.getRecoveryLogs(),
    performanceHistory: fs.getPerformanceHistory(),
  };
  res.json(report);
});

export default router;
