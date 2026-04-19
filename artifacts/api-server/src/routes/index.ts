import { Router, type IRouter } from "express";
import healthRouter from "./health";
import filesystemRouter from "./filesystem";
import crashRouter from "./crash";
import recoveryRouter from "./recovery";
import optimizationRouter from "./optimization";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(filesystemRouter);
router.use(crashRouter);
router.use(recoveryRouter);
router.use(optimizationRouter);
router.use(statsRouter);

export default router;
