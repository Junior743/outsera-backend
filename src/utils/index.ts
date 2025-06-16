import * as fs from "fs/promises"

export const deleteDataBaseFile = async (dbFilePath: string) => {
  try {
    await fs.unlink(dbFilePath)
    console.log(`Base de dados removida: ${dbFilePath}`)
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.log(`Base de dados não encontrada ${dbFilePath}.`)
    } else {
      console.error("Ocorreu um erro ao tentar apagar base de dados:", err)
      process.exit(1)
    }
  }
}
