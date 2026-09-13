import { ApiProperty } from '@nestjs/swagger';
import { Voting } from '../entities/voting.entity';

export class VotingResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  id: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    nullable: true,
  })
  questionId: string | null;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  answerId: string | null;

  @ApiProperty({
    example: '2026-09-09T10:30:00.000Z',
  })
  createdAt: Date;

  static fromEntity(vote: Voting): VotingResponseDto {
    const dto = new VotingResponseDto();
    dto.id = vote.id;
    dto.questionId = vote.questionId;
    dto.answerId = vote.answerId;
    dto.createdAt = vote.createdAt;
    return dto;
  }
}
