import { MovieAwardService } from "../services/MovieAwardService"
import { Request, Response } from "express"

export class MovieAwardController {
  constructor(private service: MovieAwardService) {}

  listNominatedMovies = async (request: Request, response: Response) => {
    const year = parseInt(request.params.year)

    if (isNaN(year)) {
      response.status(400).json({
        message:
          "Ano fornecido inválido. Por favor, forneça um número válido para o ano.",
      })
      return
    }

    try {
      const nominatedMovies = await this.service.listNominatedMovies(year)
      response.json(nominatedMovies)
    } catch (error) {
      response.status(500).json({
        message:
          "Erro interno do servidor ao tentar listar filmes nomeados em determinado ano.",
      })
    }
  }

  listWinners = async (request: Request, response: Response) => {
    try {
      const winners = await this.service.listWinners()
      response.json(winners)
    } catch (error) {
      response.status(500).json({
        message: "Erro interno do servidor ao tentar listar ganhadores.",
      })
    }
  }

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
