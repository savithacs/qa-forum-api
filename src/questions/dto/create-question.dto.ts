import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    example: 'How do I mock a service in NestJS?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({
    example: 'I am writing unit tests and want to mock a dependency.',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: ' [nestjs, jwt, postgres]',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
