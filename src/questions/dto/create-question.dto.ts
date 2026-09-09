import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
}
