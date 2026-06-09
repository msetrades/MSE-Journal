import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const PgStore = connectPgSimple(session);

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new PgStore({ pool }),
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // In Replit (dev or prod) the app is always served over HTTPS through the
      // proxy and the preview pane is an iframe on a different origin (replit.com),
      // so we need Secure + SameSite=None for cookies to be sent cross-site.
      secure: !!(process.env.REPL_ID || process.env.NODE_ENV === "production"),
      sameSite: (process.env.REPL_ID || process.env.NODE_ENV === "production") ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api", router);

export default app;
