import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findByUsername: vi.fn(),
  };

  const mockJwtService = {
    sign: vi.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return user without passwordHash when password is valid', async () => {
    const user = {
      id: 1,
      username: 'john',
      email: 'john@abc.com',
      passwordHash: 'hashed-password',
    };

    mockUserService.findByUsername.mockResolvedValue(user);

    vi.mocked(bcrypt.compare).mockResolvedValue(true);

    const result = await service.validateUser('john', 'password123');

    expect(result).toEqual({
      id: 1,
      username: 'john',
      email: 'john@abc.com',
    });
  });

  it('should return null when user does not exist', async () => {
    mockUserService.findByUsername.mockResolvedValue(null);

    const result = await service.validateUser('john', 'password123');

    expect(result).toBeNull();
  });

  it('should return null  when passwordin invalid', async () => {
    const user = {
      id: 1,
      username: 'john',
      email: 'john@abc.com',
      passwordHash: 'hashed-password',
    };

    mockUserService.findByUsername.mockResolvedValue(user);

    vi.mocked(bcrypt.compare).mockResolvedValue(false);

    const result = await service.validateUser('john', 'password123');

    expect(result).toBeNull();
  });

  it('should return an access token', () => {
    const user = {
      id: 1,
      username: 'john',
    };

    mockJwtService.sign.mockReturnValue('fake-jwt-token');

    const result = service.login(user);

    expect(mockJwtService.sign).toHaveBeenCalledWith({
      username: 'john',
      sub: 1,
      roles: 'admin',
    });

    expect(result).toEqual({
      access_token: 'fake-jwt-token',
    });
  });
});
