import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(analyticsRouter);
router.use(aiRouter);

export default router;
