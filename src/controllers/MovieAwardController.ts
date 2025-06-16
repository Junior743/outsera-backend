import { MovieAwardService } from "../services/MovieAwardService"
import { Request, Response } from "express"

export class MovieAwardController {
  constructor(private service: MovieAwardService) {}

  getDashboardMinMax = async (request: Request, response: Response) => {
    try {
      const dashboardMinMax = await this.service.getAwardIntervals()
      response.json(dashboardMinMax)
    } catch (error) {
      response.status(500).json({
        message:
          "Erro interno do servidor ao calcular intervalos entre as premiações.",
      })
    }
  }
}
