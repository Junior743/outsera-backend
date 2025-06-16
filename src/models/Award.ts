import { NominatedMovie } from "./NominatedMovie"
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"

@Entity("awards")
export class Award {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true })
  year!: number

  @OneToMany(() => NominatedMovie, (nominatedMovie) => nominatedMovie.award)
  nominatedMovies!: NominatedMovie[]
}
