import * as fs from "fs"
import parseCsv from "csv-parser"
import { Transform } from "stream"

interface CsvRow {
  year: string
  title: string
  studios: string
  producers: string
  winner: string
}

export class CsvService {
  async readCsv(filePath: string): Promise<CsvRow[]> {
    const results: CsvRow[] = []

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(
          parseCsv({
            mapHeaders: ({ header }) => header.trim().toLowerCase(),
            separator: ";",
          }) as Transform,
        )
        .on("data", (data: CsvRow) => {
          data.winner = data.winner?.toUpperCase() === "YES" ? "TRUE" : "FALSE"
          results.push(data)
        })
        .on("end", () => {
          resolve()
        })
        .on("error", (error) => {
          console.error(
            `Ocorreu um erro ao tentar processar dados do arquivo CSV ${filePath}: `,
            error,
          )
          reject(error)
        })
    })

    return results
  }
}
