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
import { Question } from './questions.entity';
import { Voting } from 'src/voting/entities/voting.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid' })
  questionId: string;
  @ManyToOne(() => Question, (question) => question.answers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'uuid' })
  ownerId: string;
  @ManyToOne(() => User, (user) => user.answers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => Voting, (voting) => voting.answer)
  votings: Voting[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  voteCount: number;
}
