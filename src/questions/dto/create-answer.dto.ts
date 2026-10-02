import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
  @ApiProperty({
    example:
      'You can mock the service by providing a mock implementation in the testing module.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: ' [nestjs, jwt, postgres]',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
