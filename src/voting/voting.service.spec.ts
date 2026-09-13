import { Test, TestingModule } from '@nestjs/testing';
import { VotingService } from './voting.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestionsService } from 'src/questions/questions.service';
import { Voting } from './entities/voting.entity';
import { ForbiddenException } from '@nestjs/common';

describe('VotingService', () => {
  let service: VotingService;

  const mockVotingRepository = {
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    findOne: vi.fn(),
  };

  const mockQuestionService = {
    findByIdOrFailQuestion: vi.fn(),
    findByIdOrFailAnswer: vi.fn(),
  };

  const userId = 'testuserid';
  const questionId = 'testquestionid';
  const answerId = 'testanswerid';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotingService,
        {
          provide: getRepositoryToken(Voting),
          useValue: mockVotingRepository,
        },
        {
          provide: QuestionsService,
          useValue: mockQuestionService,
        },
      ],
    }).compile();

    service = module.get<VotingService>(VotingService);
  });

  it('should create a vote for a question', async () => {
    mockQuestionService.findByIdOrFailQuestion.mockResolvedValue({
      id: questionId,
    });

    mockVotingRepository.findOne.mockResolvedValue(null);

    const voting = {
      id: 'voteid',
      voterId: userId,
      questionId,
    };

    mockVotingRepository.create.mockReturnValue(voting);
    mockVotingRepository.save.mockResolvedValue(voting);

    const result = await service.createVoting(userId, questionId);

    expect(mockQuestionService.findByIdOrFailQuestion).toHaveBeenCalledWith(
      questionId,
    );

    expect(mockVotingRepository.findOne).toHaveBeenCalledWith({
      where: {
        questionId,
        voterId: userId,
      },
    });

    expect(mockVotingRepository.create).toHaveBeenCalledWith({
      voterId: userId,
      questionId,
    });

    expect(mockVotingRepository.save).toHaveBeenCalledWith(voting);
    expect(result).toEqual(voting);
  });

  it('should create a vote for an answer', async () => {
    mockQuestionService.findByIdOrFailAnswer.mockResolvedValue({
      id: answerId,
    });

    mockVotingRepository.findOne.mockResolvedValue(null);

    const voting = {
      id: 'voteid',
      voterId: userId,
      answerId,
    };

    mockVotingRepository.create.mockReturnValue(voting);
    mockVotingRepository.save.mockResolvedValue(voting);

    const result = await service.createVoting(userId, undefined, answerId);

    expect(mockQuestionService.findByIdOrFailAnswer).toHaveBeenCalledWith(
      answerId,
    );

    expect(mockVotingRepository.findOne).toHaveBeenCalledWith({
      where: {
        answerId,
        voterId: userId,
      },
    });

    expect(mockVotingRepository.create).toHaveBeenCalledWith({
      voterId: userId,
      answerId,
    });

    expect(mockVotingRepository.save).toHaveBeenCalledWith(voting);
    expect(result).toEqual(voting);
  });

  it('should reject voting when neither or both targets are provided', async () => {
    await expect(service.createVoting(userId)).rejects.toThrow(
      'Provide either questionId or answerId',
    );

    await expect(
      service.createVoting(userId, questionId, answerId),
    ).rejects.toThrow('Provide either questionId or answerId');
  });

  it('should delete voting and return affected value', async () => {
    const voting = {
      id: 'voteid',
      voterId: userId,
      answerId,
    };

    mockVotingRepository.findOne.mockResolvedValue(voting);
    mockVotingRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.removeVoting(voting.id, userId);

    expect(mockVotingRepository.delete).toHaveBeenCalledWith(voting.id);

    expect(result).toEqual({ affected: 1 });
  });

  it('should throw ForbiddenException when user is not the owner while deleting voting', async () => {
    const voting = {
      id: 'voteid',
      voterId: 'another user',
      answerId,
    };

    mockVotingRepository.findOne.mockResolvedValue(voting);

    await expect(service.removeVoting(voting.id, userId)).rejects.toThrow(
      new ForbiddenException('You can delete only your own voting'),
    );

    expect(mockVotingRepository.delete).not.toHaveBeenCalled();
  });
});
