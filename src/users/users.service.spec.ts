import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    create: vi.fn(),
    save: vi.fn(),
  };

  vi.mock('bcrypt', () => ({
    hash: vi.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create user with a hashed password', async () => {
    const dto = {
      username: 'TestUser',
      email: 'test@example.com',
      password: 'password123',
    };

    vi.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashed-password');

    const user = {
      id: '123',
      username: dto.username,
      email: dto.email,
      passwordHash: 'hashed-password',
    };

    mockUserRepository.create.mockReturnValue(user);
    mockUserRepository.save.mockResolvedValue(user);

    const result = await service.createUser(dto);

    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      username: dto.username,
      email: dto.email,
      passwordHash: 'hashed-password',
    });

    expect(mockUserRepository.save).toHaveBeenCalledWith(user);

    expect(result).toEqual(user);
  });

  it('should create user with a hashed password', async () => {
    const dto = {
      username: 'TestUser',
      email: 'test@example.com',
      password: 'password123',
    };

    vi.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashed-password');

    const user = {
      id: '123',
      username: dto.username,
      email: dto.email,
      passwordHash: 'hashed-password',
    };

    mockUserRepository.create.mockReturnValue(user);
    mockUserRepository.save.mockResolvedValue(user);

    const result = await service.createUser(dto);

    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

    expect(mockUserRepository.create).toHaveBeenCalledWith({
      username: dto.username,
      email: dto.email,
      passwordHash: 'hashed-password',
    });

    expect(mockUserRepository.save).toHaveBeenCalledWith(user);

    expect(result).toEqual(user);
  });
});
