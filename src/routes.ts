import express from "express";
import facebookRouterV1 from "./routes/v1/facebook.route"

// Router imports
// End of router imports

const router = express.Router();

// Route routers
// End of routing routers

router.use("/v1/facebook", facebookRouterV1);
export default router;
