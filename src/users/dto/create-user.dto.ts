import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'alice',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  username: string;

  @ApiProperty({
    example: 'alice@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  email: string;

  @ApiProperty({
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  password: string;
}
