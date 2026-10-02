import { Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Tag } from './tag.entity';
import { Question } from 'src/questions/entities/questions.entity';

@Entity('question_tags')
@Unique(['questionId', 'tagId'])
export class QuestionTag {
  @PrimaryColumn({ type: 'uuid' })
  tagId: string;

  @ManyToOne(() => Tag, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tagId' })
  tag: Tag | null;

  @PrimaryColumn({ type: 'uuid' })
  questionId: string;

  @ManyToOne(() => Question, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: Question | null;
}
