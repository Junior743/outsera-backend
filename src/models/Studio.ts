import { Movie } from "./Movie"
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"

@Entity("studios")
export class Studio {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  name!: string

  @ManyToMany(() => Movie, (movie) => movie.studios)
  movies!: Movie[]
}
