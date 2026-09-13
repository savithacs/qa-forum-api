import { User } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from './answers.entity';
import { Voting } from 'src/voting/entities/voting.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid' })
  ownerId: string;
  @ManyToOne(() => User, (user) => user.questions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @OneToMany(() => Voting, (voting) => voting.question)
  votings: Voting[];

  voteCount: number;
}
