import { MovieAwardController } from "../controllers/MovieAwardController"
import { MovieAwardService } from "../services/MovieAwardService"
import { Router } from "express"

const router = Router()

const service = new MovieAwardService()
const controller = new MovieAwardController(service)

router.get("/health", (req, res) => {
  res.send("API Golden Raspberry Awards está funcionando!")
})
router.get("/dashboard/min-max", controller.getDashboardMinMax)

export default router
