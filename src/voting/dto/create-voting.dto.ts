import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateVotingDto {
  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  @IsString()
  @IsOptional()
  questionId: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  @IsString()
  @IsOptional()
  answerId: string;
}
