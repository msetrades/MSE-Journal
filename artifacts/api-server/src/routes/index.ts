import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tradesRouter from "./trades";
import journalsRouter from "./journals";
import noTradeDaysRouter from "./no-trade-days";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tradesRouter);
router.use(journalsRouter);
router.use(noTradeDaysRouter);

export default router;
