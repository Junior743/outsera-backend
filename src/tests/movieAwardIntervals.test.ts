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
