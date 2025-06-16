import { MovieAwardService } from "../services/MovieAwardService"
import { initializeDatabase } from "../config/database"
import { AppDataSource } from "../config/database"
import { CsvService } from "../services/CsvService"
import { deleteDataBaseFile } from "../utils"
import { app } from ".."
import request from "supertest"
import dotenv from "dotenv"
import path from "path"

dotenv.config()

const testCsvFilePath = path.join(__dirname, "testdata.csv")
const dbFilePath = path.join(
  __dirname,
  "..",
  "..",
  process.env.DATABASE_FILE_NAME_TEST || "test_database.sqlite",
)

describe("Award Intervals API Integration Test", () => {
  beforeAll(async () => {
    await deleteDataBaseFile(dbFilePath)
    await initializeDatabase(dbFilePath)

    const csvService = new CsvService()
    const movieAwardService = new MovieAwardService()
    const csvData = await csvService.readCsv(testCsvFilePath)
    await movieAwardService.importParsedData(csvData)
  }, 60000)

  afterAll(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy()
    await deleteDataBaseFile(dbFilePath)
  })

  describe("GET /api/v1/dashboard/min-max", () => {
    it("should return the correct min and max award intervals based on test data", async () => {
      const response = await request(app).get("/api/v1/dashboard/min-max")

      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toMatch(/json/)

      const expectedData = {
        min: [
          {
            producer: "Joel Silver",
            interval: 1,
            previousWin: 1990,
            followingWin: 1991,
          },
        ],
        max: [
          {
            producer: "Matthew Vaughn",
            interval: 13,
            previousWin: 2002,
            followingWin: 2015,
          },
        ],
      }

      expect(response.body).toEqual(expectedData)
    })
  })

  describe("GET /api/v1/winners", () => {
    it("should return a list of all winners", async () => {
      const response = await request(app).get("/api/v1/winners")

      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toMatch(/json/)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)

      const firstWinner = response.body[0]
      expect(firstWinner).toHaveProperty("id")
      expect(firstWinner).toHaveProperty("year", 1980)
      expect(firstWinner).toHaveProperty("title", "Can't Stop the Music")
      expect(firstWinner).toHaveProperty(
        "studios",
        "Associated Film Distribution",
      )
      expect(firstWinner).toHaveProperty("producers", "Allan Carr")
      expect(firstWinner).toHaveProperty("winner", true)

      const secondWinner = response.body[1]
      expect(secondWinner).toHaveProperty("year", 1981)
      expect(secondWinner).toHaveProperty("title", "Mommie Dearest")
      expect(secondWinner).toHaveProperty("winner", true)

      response.body.forEach((item: any) => {
        expect(item.winner).toBe(true)
      })
    })
  })

  describe("GET /api/v1/nominated-movies/:year", () => {
    it("should return nominees for a specific year (1980)", async () => {
      const response = await request(app).get("/api/v1/nominated-movies/1980")

      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toMatch(/json/)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(10)

      const winner1980 = response.body.find(
        (n: any) => n.title === "Can't Stop the Music",
      )
      expect(winner1980).toBeDefined()
      expect(winner1980).toHaveProperty("winner", true)

      const nonWinner1980 = response.body.find(
        (n: any) => n.title === "Cruising",
      )
      expect(nonWinner1980).toBeDefined()
      expect(nonWinner1980).toHaveProperty("winner", false)

      response.body.forEach((item: any) => {
        expect(item.year).toBe(1980)
      })
    })

    it("should return an empty array for a year with no nominees (9999)", async () => {
      const response = await request(app).get("/api/v1/nominated-movies/9999")

      expect(response.statusCode).toBe(200)
      expect(response.headers["content-type"]).toMatch(/json/)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(0)
    })

    it("should return 400 for an invalid year parameter", async () => {
      const response = await request(app).get("/api/v1/nominated-movies/abc")

      expect(response.statusCode).toBe(400)
      expect(response.headers["content-type"]).toMatch(/json/)
      expect(response.body).toHaveProperty(
        "message",
        "Ano fornecido inválido. Por favor, forneça um número válido para o ano.",
      )
    })
  })
})
