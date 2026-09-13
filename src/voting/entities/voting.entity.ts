import { Answer } from 'src/questions/entities/answers.entity';
import { Question } from 'src/questions/entities/questions.entity';
import { User } from 'src/users/entities/users.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Index(['voterId', 'questionId'], {
  unique: true,
  where: '"questionId" IS NOT NULL',
})
@Index(['voterId', 'answerId'], {
  unique: true,
  where: '"answerId" IS NOT NULL',
})
@Check(
  `("questionId" IS NOT NULL AND "answerId" IS NULL) OR ("questionId" IS NULL AND "answerId" IS NOT NULL)`,
)
@Entity('voting')
export class Voting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  questionId: string | null;

  @ManyToOne(() => Question, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: Question | null;

  @Column({ type: 'uuid', nullable: true })
  answerId: string | null;

  @ManyToOne(() => Answer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'answerId' })
  answer: Answer | null;

  @Column({ type: 'uuid' })
  voterId: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'voterId' })
  voter: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
