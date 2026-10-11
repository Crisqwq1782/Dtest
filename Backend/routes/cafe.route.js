import { Router } from "express";
import { cafeController } from "../controllers/cafe.controller.js";

const router = Router();

router.get("/", cafeController.read);
router.post("/", cafeController.create);
router.put("/:id", cafeController.update);
router.delete("/:id", cafeController.remove);

export default router;
