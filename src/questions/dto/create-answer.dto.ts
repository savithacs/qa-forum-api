import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnswerDto {
  @ApiProperty({
    example:
      'You can mock the service by providing a mock implementation in the testing module.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
