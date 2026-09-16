import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuestionsService } from './questions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Question } from './entities/questions.entity';
import { Answer } from './entities/answers.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Voting } from 'src/voting/entities/voting.entity';

describe('QuestionsService', () => {
  let service: QuestionsService;

  const mockQuestionRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findAndCount: vi.fn(),
  };

  const mockAnswerRepository = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    getRawMany: vi.fn(),
  };

  const mockVotingRepository = {
    createQueryBuilder: vi.fn(() => mockQueryBuilder),
  };

  const questionDto = {
    title: 'Test Question',
    description: 'Test Question Description',
  };
  const answerDto = {
    content: 'Test answer',
  };
  const userId = 'testuserid';
  const questionId = 'testquestionid';
  const answerId = 'testanswerid';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepository,
        },

        {
          provide: getRepositoryToken(Answer),
          useValue: mockAnswerRepository,
        },
        {
          provide: getRepositoryToken(Voting),
          useValue: mockVotingRepository,
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
  });

  it('should retreive all answers', async () => {
    const allQuestion = [
      {
        id: '11111111-2222-1111-2222-111111111111',
        title: 'first question for testing',
        description: 'first description',
        owner: {
          username: 'TestUser2',
          id: '11111111-2222-2222-2222-111111111111',
          email: 'abc2@example.com',
        },
        createdAt: '2026-08-25T16:21:36.574Z',
      },
    ];

    mockQuestionRepository.findAndCount.mockResolvedValue([allQuestion, 1]);

    mockQueryBuilder.getRawMany.mockResolvedValue([
      {
        questionId: '11111111-2222-1111-2222-111111111111',
        count: '3',
      },
    ]);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data).toEqual(allQuestion);
    expect(result.data[0].voteCount).toBe(3);

    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('should retreive question with all answers by question Id', async () => {
    const question = {
      id: '11111111-2222-1111-2222-111111111111',
      title: 'first question for testing',
      description: 'first description',
      owner: {
        username: 'TestUser2',
        id: '11111111-2222-2222-2222-111111111111',
        email: 'abc2@example.com',
      },
      createdAt: '2026-08-25T16:21:36.574Z',
      answers: [
        {
          id: '11111111-2222-1111-1111-111111111111',
          content: 'first answer',
          answerBy: {
            username: 'TestUser',
            id: '11111111-2222-2222-2222-111111111111',
            email: 'abc@example.com',
          },
          createdAt: '2026-09-02T12:30:37.852Z',
        },
      ],
    };

    mockQuestionRepository.findOne.mockResolvedValue(question);

    mockVotingRepository.createQueryBuilder
      .mockReturnValueOnce(mockQueryBuilder)
      .mockReturnValueOnce(mockQueryBuilder);

    mockQueryBuilder.getRawMany
      .mockResolvedValueOnce([
        {
          questionId: '11111111-2222-1111-2222-111111111111',
          count: '5',
        },
      ])
      .mockResolvedValueOnce([
        {
          answerId: '11111111-2222-1111-1111-111111111111',
          count: '2',
        },
      ]);

    const result = await service.findById(
      '11111111-2222-1111-2222-111111111111',
    );

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: '11111111-2222-1111-2222-111111111111',
        },
      }),
    );

    expect(result).toEqual(question);
    expect(result.voteCount).toBe(5);
    expect(result.answers[0].voteCount).toBe(2);
  });

  it('should throw not found exception when with incorrect question Id', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(null);

    await expect(service.findById('2')).rejects.toThrow(
      new NotFoundException('Question not found'),
    );
  });

  it('should create question and return the created object', async () => {
    const question = {
      ...questionDto,
      ownerId: userId,
    };

    mockQuestionRepository.create.mockReturnValue(question);
    mockQuestionRepository.save.mockResolvedValue(question);

    const result = await service.createQuestion(questionDto, userId);

    expect(mockQuestionRepository.create).toHaveBeenCalledWith(question);

    expect(mockQuestionRepository.save).toHaveBeenCalledWith(question);

    expect(result).toEqual(question);
  });

  it('should return question when question exists', async () => {
    const question = {
      id: questionId,
      ownerId: userId,
    };

    mockQuestionRepository.findOne.mockResolvedValue(question);

    const result = await service.findByIdOrFailQuestion(questionId);

    expect(result).toEqual(question);
  });

  it('should throw NotFoundException when question does not exist', async () => {
    mockQuestionRepository.findOne.mockResolvedValue(null);

    await expect(service.findByIdOrFailQuestion(questionId)).rejects.toThrow(
      new NotFoundException('Question not found'),
    );
  });

  it('should update question and return affected value', async () => {
    const question = {
      id: questionId,
      ...questionDto,
      ownerId: userId,
    };

    mockQuestionRepository.findOne.mockResolvedValue(question);
    mockQuestionRepository.update.mockResolvedValue({ affected: 1 });

    const result = await service.updateQuestion(
      questionId,
      questionDto,
      userId,
    );

    expect(mockQuestionRepository.update).toHaveBeenCalledWith(
      questionId,
      questionDto,
    );

    expect(result).toEqual({ affected: 1 });
  });

  it('should throw Forbiddenexception when user is not the owner while updating question', async () => {
    const question = {
      id: questionId,
      ...questionDto,
      ownerId: 'another user',
    };

    mockQuestionRepository.findOne.mockResolvedValue(question);

    await expect(
      service.updateQuestion(questionId, questionDto, userId),
    ).rejects.toThrow(
      new ForbiddenException('You can edit only your own questions'),
    );

    expect(mockQuestionRepository.update).not.toHaveBeenCalled();
  });

  it('should delete question and return affected value', async () => {
    const question = {
      id: questionId,
      ...questionDto,
      ownerId: userId,
    };

    mockQuestionRepository.findOne.mockResolvedValue(question);
    mockQuestionRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.deleteQuestion(questionId, userId);

    expect(mockQuestionRepository.delete).toHaveBeenCalledWith(questionId);

    expect(result).toEqual({ affected: 1 });
  });

  it('should throw Forbiddenexception when user is not the owner while deleting question', async () => {
    const question = {
      id: questionId,
      ...questionDto,
      ownerId: 'another user',
    };

    mockQuestionRepository.findOne.mockResolvedValue(question);

    await expect(service.deleteQuestion(questionId, userId)).rejects.toThrow(
      new ForbiddenException('You can delete only your own questions'),
    );

    expect(mockQuestionRepository.delete).not.toHaveBeenCalled();
  });

  it('should create answer and return the created object', async () => {
    const answer = {
      ...answerDto,
      ownerId: userId,
      questionId,
    };

    mockAnswerRepository.create.mockReturnValue(answer);
    mockAnswerRepository.save.mockResolvedValue(answer);

    const result = await service.createAnswer(questionId, answer, userId);

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
      where: {
        id: questionId,
      },
    });
    expect(mockAnswerRepository.create).toHaveBeenCalledWith(answer);

    expect(mockAnswerRepository.save).toHaveBeenCalledWith(answer);

    expect(result).toEqual(answer);
  });

  it('should return answer when question exists', async () => {
    const answer = {
      id: answerId,
      ownerId: userId,
    };

    mockAnswerRepository.findOne.mockResolvedValue(answer);

    const result = await service.findByIdOrFailAnswer(answerId);

    expect(result).toEqual(answer);
  });

  it('should throw NotFoundException when answer does not exist', async () => {
    mockAnswerRepository.findOne.mockResolvedValue(null);

    await expect(service.findByIdOrFailAnswer(answerId)).rejects.toThrow(
      new NotFoundException('Answer not found'),
    );
  });

  it('should update answer and return affected value', async () => {
    const answer = {
      id: answerId,
      ...answerDto,
      ownerId: userId,
    };

    mockAnswerRepository.findOne.mockResolvedValue(answer);
    mockAnswerRepository.update.mockResolvedValue({ affected: 1 });

    const result = await service.updateAnswer(answerId, answerDto, userId);

    expect(mockAnswerRepository.update).toHaveBeenCalledWith(
      answerId,
      answerDto,
    );

    expect(result).toEqual({ affected: 1 });
  });

  it('should throw Forbiddenexception when user is not the owner while updating answer', async () => {
    const answer = {
      id: answerId,
      ownerId: 'another user',
    };

    mockAnswerRepository.findOne.mockResolvedValue(answer);

    await expect(
      service.updateAnswer(answerId, answerDto, userId),
    ).rejects.toThrow(
      new ForbiddenException('You can edit only your own answers'),
    );

    expect(mockAnswerRepository.update).not.toHaveBeenCalled();
  });

  it('should delete answer and return affected value', async () => {
    const answer = {
      id: answerId,
      ownerId: userId,
    };

    mockAnswerRepository.findOne.mockResolvedValue(answer);
    mockAnswerRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.deleteAnswer(answerId, userId);

    expect(mockAnswerRepository.delete).toHaveBeenCalledWith(answerId);

    expect(result).toEqual({ affected: 1 });
  });

  it('should throw Forbiddenexception when user is not the owner while deleting answer', async () => {
    const answer = {
      id: answerId,
      ownerId: 'another user',
    };

    mockAnswerRepository.findOne.mockResolvedValue(answer);

    await expect(service.deleteAnswer(answerId, userId)).rejects.toThrow(
      new ForbiddenException('You can delete only your own answers'),
    );

    expect(mockAnswerRepository.delete).not.toHaveBeenCalled();
  });
});
