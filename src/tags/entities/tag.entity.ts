import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionTag } from './questionTag.entity';
import { AnswerTag } from './answerTag.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  tagName: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => QuestionTag, (questionTag) => questionTag.tag)
  questionTags: QuestionTag[];

  @OneToMany(() => AnswerTag, (answerTag) => answerTag.tag)
  answerTags: AnswerTag[];
}
