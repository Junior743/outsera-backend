import { NominatedMovie } from "../models/NominatedMovie"
import { AppDataSource } from "../config/database"
import { Producer } from "../models/Producer"
import { Studio } from "../models/Studio"
import { Movie } from "../models/Movie"
import { Award } from "../models/Award"
import { Repository } from "typeorm"

interface AwardInterval {
  producer: string
  interval: number
  previousWin: number
  followingWin: number
}

export interface AwardIntervalsResponse {
  min: AwardInterval[]
  max: AwardInterval[]
}

export interface NomineeResponse {
  id: number
  year: number
  title: string
  studios: string
  producers: string
  winner: boolean
}

interface CsvRowData {
  year: string
  title: string
  studios: string
  producers: string
  winner: string
}

export class MovieAwardService {
  private isAppDataSourceInitialized = () => {
    if (!AppDataSource || !AppDataSource.isInitialized)
      throw new Error("AppDataSource não está inicializado.")
  }

  private getMovieRepository = (): Repository<Movie> => {
    this.isAppDataSourceInitialized()
    return AppDataSource.getRepository(Movie)
  }

  private getAwardRepository = (): Repository<Award> => {
    this.isAppDataSourceInitialized()
    return AppDataSource.getRepository(Award)
  }

  private getStudioRepository = (): Repository<Studio> => {
    this.isAppDataSourceInitialized()
    return AppDataSource.getRepository(Studio)
  }

  private getProducerRepository = (): Repository<Producer> => {
    this.isAppDataSourceInitialized()
    return AppDataSource.getRepository(Producer)
  }

  private getNominatedMovieRepository = (): Repository<NominatedMovie> => {
    this.isAppDataSourceInitialized()
    return AppDataSource.getRepository(NominatedMovie)
  }

  private async findOrCreateAward(year: number): Promise<Award> {
    let award = await this.getAwardRepository().findOne({ where: { year } })
    if (!award) {
      award = this.getAwardRepository().create({ year })
      await this.getAwardRepository().save(award)
    }

    return award
  }

  private async findOrCreateStudio(name: string): Promise<Studio> {
    let studio = await this.getStudioRepository().findOne({ where: { name } })
    if (!studio) {
      studio = this.getStudioRepository().create({ name })
      await this.getStudioRepository().save(studio)
    }

    return studio
  }

  private async findOrCreateProducer(name: string): Promise<Producer> {
    let producer = await this.getProducerRepository().findOne({
      where: { name },
    })
    if (!producer) {
      producer = this.getProducerRepository().create({ name })
      await this.getProducerRepository().save(producer)
    }

    return producer
  }

  private async findOrCreateMovie(
    title: string,
    studios: Studio[],
    producers: Producer[],
  ): Promise<Movie> {
    let movie = await this.getMovieRepository().findOne({ where: { title } })
    if (!movie) {
      movie = this.getMovieRepository().create({ title, studios, producers })
      await this.getMovieRepository().save(movie)
    } else {
      const existingMovieWithRelations =
        await this.getMovieRepository().findOne({
          where: { id: movie.id },
          relations: ["studios", "producers"],
        })

      if (existingMovieWithRelations) {
        const currentStudioIds = new Set(
          existingMovieWithRelations.studios.map(({ id }) => id),
        )
        const newStudiosToAdd = studios.filter(
          ({ id }) => !currentStudioIds.has(id),
        )
        existingMovieWithRelations.studios.push(...newStudiosToAdd)

        const currentProducerIds = new Set(
          existingMovieWithRelations.producers.map(({ id }) => id),
        )
        const newProducersToAdd = producers.filter(
          ({ id }) => !currentProducerIds.has(id),
        )
        existingMovieWithRelations.producers.push(...newProducersToAdd)

        await this.getMovieRepository().save(existingMovieWithRelations)
        movie = existingMovieWithRelations
      }
    }

    return movie
  }

  private async createOrUpdateNominatedMovie(
    award: Award,
    movie: Movie,
    year: number,
    isWinner: boolean,
  ): Promise<NominatedMovie> {
    const existingNomination = await this.getNominatedMovieRepository().findOne(
      {
        where: {
          awardId: award.id,
          movieId: movie.id,
          year: year,
        },
      },
    )

    if (existingNomination) {
      if (existingNomination.winner !== isWinner) {
        existingNomination.winner = isWinner
        await this.getNominatedMovieRepository().save(existingNomination)
      }
      return existingNomination
    } else {
      const nominatedMovie = this.getNominatedMovieRepository().create({
        award: award,
        movie: movie,
        awardId: award.id,
        movieId: movie.id,
        year: year,
        winner: isWinner,
      })
      await this.getNominatedMovieRepository().save(nominatedMovie)
      return nominatedMovie
    }
  }

  private async processCsvRowData(row: CsvRowData): Promise<void> {
    const year = parseInt(row.year)
    if (isNaN(year)) return

    const award = await this.findOrCreateAward(year)

    const studioNames = row.studios
      .split(/ and |,|\band\b/i)
      .map((s) => s.trim())
      .filter((s) => s.length)
    const movieStudiosPromises = studioNames.map((name) =>
      this.findOrCreateStudio(name),
    )
    const movieStudios = await Promise.all(movieStudiosPromises)

    const producerNames = row.producers
      .split(/ and |,|\band\b/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
    const movieProducersPromises = producerNames.map((name) =>
      this.findOrCreateProducer(name),
    )
    const movieProducers = await Promise.all(movieProducersPromises)

    const movie = await this.findOrCreateMovie(
      row.title,
      movieStudios,
      movieProducers,
    )

    await this.createOrUpdateNominatedMovie(
      award,
      movie,
      year,
      row.winner === "TRUE",
    )
  }

  async importParsedData(data: CsvRowData[]): Promise<void> {
    for (const row of data) await this.processCsvRowData(row)
  }

  async listNominatedMovies(year: number): Promise<NomineeResponse[]> {
    const nominees = await this.getNominatedMovieRepository()
      .createQueryBuilder("nominatedMovie")
      .innerJoinAndSelect("nominatedMovie.movie", "movie")
      .innerJoinAndSelect("nominatedMovie.award", "award")
      .leftJoinAndSelect("movie.studios", "studios")
      .leftJoinAndSelect("movie.producers", "producers")
      .where("award.year = :year", { year })
      .orderBy("nominatedMovie.winner", "DESC")
      .addOrderBy("movie.title", "ASC")
      .getMany()

    const response = nominees.map((nomination) => ({
      id: nomination.movie.id,
      year: nomination.award.year,
      title: nomination.movie.title,
      studios: nomination.movie.studios.map((s) => s.name).join(", "),
      producers: nomination.movie.producers.map((p) => p.name).join(", "),
      winner: nomination.winner,
    }))

    return response
  }

  async listWinners(): Promise<NomineeResponse[]> {
    const winners = await this.getNominatedMovieRepository()
      .createQueryBuilder("nominatedMovie")
      .innerJoinAndSelect("nominatedMovie.movie", "movie")
      .innerJoinAndSelect("nominatedMovie.award", "award")
      .leftJoinAndSelect("movie.studios", "studios")
      .leftJoinAndSelect("movie.producers", "producers")
      .where("nominatedMovie.winner = :winnerStatus", { winnerStatus: true })
      .orderBy("award.year", "ASC")
      .getMany()

    const response = winners.map((nomination) => ({
      id: nomination.movie.id,
      year: nomination.award.year,
      title: nomination.movie.title,
      studios: nomination.movie.studios.map((s) => s.name).join(", "),
      producers: nomination.movie.producers.map((p) => p.name).join(", "),
      winner: nomination.winner,
    }))

    return response
  }

  async getAwardIntervals(): Promise<AwardIntervalsResponse> {
    const winnerNominations = await this.getNominatedMovieRepository()
      .createQueryBuilder("nominatedMovie")
      .innerJoinAndSelect("nominatedMovie.movie", "movie")
      .innerJoinAndSelect("movie.producers", "producer")
      .where("nominatedMovie.winner = :winnerStatus", { winnerStatus: true })
      .orderBy("nominatedMovie.year", "ASC")
      .getMany()

    const producerWins: Map<string, number[]> = new Map()

    for (const nomination of winnerNominations) {
      for (const producer of nomination.movie.producers) {
        if (!producerWins.has(producer.name))
          producerWins.set(producer.name, [])

        producerWins.get(producer.name)!.push(nomination.year)
      }
    }

    const allAwardIntervals: AwardInterval[] = Array.from(
      producerWins.entries(),
    ).flatMap(([producerName, years]) => {
      if (years.length < 2) return []

      years.sort((a, b) => a - b)

      return years.slice(0, years.length - 1).map((previousWin, index) => {
        const followingWin = years[index + 1]
        const interval = followingWin - previousWin
        return {
          producer: producerName,
          interval,
          previousWin,
          followingWin,
        }
      })
    })

    if (allAwardIntervals.length === 0) return { min: [], max: [] }

    const minIntervalValue = Math.min(
      ...allAwardIntervals.map((item) => item.interval),
    )
    const maxIntervalValue = Math.max(
      ...allAwardIntervals.map((item) => item.interval),
    )

    const finalMinIntervals = allAwardIntervals.filter(
      (item) => item.interval === minIntervalValue,
    )
    const finalMaxIntervals = allAwardIntervals.filter(
      (item) => item.interval === maxIntervalValue,
    )

    return {
      min: finalMinIntervals,
      max: finalMaxIntervals,
    }
  }
}
