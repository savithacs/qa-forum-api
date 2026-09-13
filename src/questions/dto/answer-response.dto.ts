import { ApiProperty } from '@nestjs/swagger';
import { Answer } from '../entities/answers.entity';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

export class AnswerResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  id: string;

  @ApiProperty({
    example: 'You can mock the service using a testing module.',
  })
  content: string;

  @ApiProperty({
    type: () => UserResponseDto,
  })
  answerBy: UserResponseDto;

  @ApiProperty({
    example: 5,
    description: 'Number of votes for this answer',
  })
  voteCount: number;

  @ApiProperty({
    example: '2026-09-09T10:30:00.000Z',
  })
  createdAt: Date;

  static fromEntity(answer: Answer, voteCount: number): AnswerResponseDto {
    const dto = new AnswerResponseDto();
    dto.id = answer.id;
    dto.content = answer.content;
    dto.createdAt = answer.createdAt;
    dto.voteCount = voteCount;
    // The relation is loaded on some code paths and not on others, so read the
    // id defensively rather than assuming `offer.auction` is there.
    dto.answerBy = answer.owner
      ? UserResponseDto.fromEntity(answer.owner)
      : undefined;

    return dto;
  }
}
