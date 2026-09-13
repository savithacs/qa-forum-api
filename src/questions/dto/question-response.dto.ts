import { AnswerResponseDto } from './answer-response.dto';
import { Question } from '../entities/questions.entity';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  id: string;

  @ApiProperty({
    example: 'How do I mock a service in NestJS?',
  })
  title: string;

  @ApiProperty({
    example: 'I am writing unit tests and want to mock a dependency.',
  })
  description: string;

  @ApiProperty({
    type: () => UserResponseDto,
  })
  questionBy: UserResponseDto;

  @ApiProperty({
    example: 5,
    description: 'Number of votes for this question',
  })
  voteCount: number;

  @ApiProperty({
    example: '2026-09-09T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    type: () => [AnswerResponseDto],
  })
  answers: AnswerResponseDto[];

  static fromEntity(
    question: Question,
    voteCount: number,
  ): QuestionResponseDto {
    const dto = new QuestionResponseDto();
    dto.id = question.id;
    dto.title = question.title;
    dto.description = question.description;
    dto.createdAt = question.createdAt;
    dto.voteCount = voteCount;
    // The relation is loaded on some code paths and not on others, so read the
    // id defensively rather than assuming `offer.auction` is there.
    dto.questionBy = question.owner
      ? UserResponseDto.fromEntity(question.owner)
      : undefined;
    if (question.answers)
      dto.answers = question.answers
        ? question.answers.map((answer) =>
          AnswerResponseDto.fromEntity(answer, answer.voteCount),
        )
        : [];
    return dto;
  }
}
