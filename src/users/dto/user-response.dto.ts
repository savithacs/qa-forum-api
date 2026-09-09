import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/users.entity';

export class UserResponseDto {
  @ApiProperty({
    example: 'alice',
  })
  username: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  id: string;

  @ApiProperty({
    example: 'alice@example.com',
  })
  email: string;
  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.username = user.username;
    return dto;
  }
}
