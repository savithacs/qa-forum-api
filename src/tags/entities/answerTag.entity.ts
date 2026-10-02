import { Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Tag } from './tag.entity';
import { Answer } from 'src/questions/entities/answers.entity';

@Entity('answer_tags')
@Unique(['answerId', 'tagId'])
export class AnswerTag {
  @PrimaryColumn({ type: 'uuid' })
  tagId: string;

  @ManyToOne(() => Tag, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tagId' })
  tag: Tag | null;

  @PrimaryColumn({ type: 'uuid' })
  answerId: string;

  @ManyToOne(() => Answer, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'answerId' })
  answer: Answer | null;
}
