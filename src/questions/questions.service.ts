import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entities/questions.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Answer } from './entities/answers.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { Voting } from 'src/voting/entities/voting.entity';
import { QuestionQueryDto } from './dto/question-query.dto';

type VoteCount = {
  questionId: string;
  count: string;
};
type AnswerVoteCount = {
  answerId: string;
  count: string;
};

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questions: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answers: Repository<Answer>,
    @InjectRepository(Voting)
    private readonly voting: Repository<Voting>,
  ) { }

  async findAll(query: QuestionQueryDto) {
    const { page, limit, search } = query;
    const where: FindOptionsWhere<Question>[] | undefined = search
      ? [{ title: Like(`%${search}%`) }, { description: Like(`%${search}%`) }]
      : undefined;
    const [data, total] = await this.questions.findAndCount({
      where,
      relations: {
        owner: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const voteCounts = await this.voting
      .createQueryBuilder('voting')
      .select('voting.questionId', 'questionId')
      .addSelect('COUNT(voting.id)', 'count')
      .where('voting.questionId IS NOT NULL')
      .groupBy('voting.questionId')
      .getRawMany<VoteCount>();

    const counts = new Map(
      voteCounts.map((item) => [item.questionId, Number(item.count)]),
    );

    for (const question of data) {
      question.voteCount = counts.get(question.id) ?? 0;
    }

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    //return questions;
  }

  async findById(id: string) {
    const question = await this.questions.findOne({
      where: { id },
      relations: {
        owner: true,
        answers: {
          owner: true,
        },
      },
    });
    if (!question) throw new NotFoundException('Question not found');
    const questionVoteCounts = await this.voting
      .createQueryBuilder('voting')
      .select('voting.questionId', 'questionId')
      .addSelect('COUNT(voting.id)', 'count')
      .where('voting.questionId IS NOT NULL')
      .groupBy('voting.questionId')
      .getRawMany<VoteCount>();

    const counts = new Map(
      questionVoteCounts.map((item) => [item.questionId, Number(item.count)]),
    );

    question.voteCount = counts.get(question.id) ?? 0;

    const answerIds = question.answers.map((answer) => answer.id);
    if (answerIds.length > 0) {
      const answerVoteCounts = await this.voting
        .createQueryBuilder('voting')
        .select('voting.answerId', 'answerId')
        .addSelect('COUNT(voting.id)', 'count')
        .where('voting.answerId IN (:...answerIds)', { answerIds })
        .groupBy('voting.answerId')
        .getRawMany<AnswerVoteCount>();

      const answerCounts = new Map(
        answerVoteCounts.map((item) => [item.answerId, Number(item.count)]),
      );

      for (const answer of question.answers) {
        answer.voteCount = answerCounts.get(answer.id) ?? 0;
      }
    }
    return question;
  }

  createQuestion(dto: CreateQuestionDto, userId: string) {
    const question = this.questions.create({ ...dto, ownerId: userId });
    return this.questions.save(question);
  }

  async findByIdOrFailQuestion(id: string): Promise<Question> {
    const question = await this.questions.findOne({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async updateQuestion(
    questionId: string,
    dto: UpdateQuestionDto,
    userId: string,
  ) {
    const question = await this.findByIdOrFailQuestion(questionId);
    if (question.ownerId != userId) {
      throw new ForbiddenException('You can edit only your own questions');
    }

    return this.questions.update(questionId, dto);
  }

  async deleteQuestion(questionId: string, userId: string) {
    const question = await this.findByIdOrFailQuestion(questionId);
    if (question.ownerId != userId) {
      throw new ForbiddenException('You can delete only your own questions');
    }

    return this.questions.delete(questionId);
  }

  async createAnswer(questionId: string, dto: CreateAnswerDto, userId: string) {
    const question = await this.findByIdOrFailQuestion(questionId);
    if (question) {
      const answer = this.answers.create({
        questionId,
        content: dto.content,
        ownerId: userId,
      });

      return this.answers.save(answer);
    }
  }

  async findByIdOrFailAnswer(id: string): Promise<Answer> {
    const answer = await this.answers.findOne({
      where: { id },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    return answer;
  }

  async updateAnswer(id: string, dto: CreateAnswerDto, userId: string) {
    const answer = await this.findByIdOrFailAnswer(id);

    if (answer.ownerId != userId) {
      throw new ForbiddenException('You can edit only your own answers');
    }

    return this.answers.update(id, dto);
  }

  async deleteAnswer(id: string, userId: string) {
    const answer = await this.findByIdOrFailAnswer(id);

    if (answer.ownerId != userId) {
      throw new ForbiddenException('You can delete only your own answers');
    }

    return this.answers.delete(id);
  }
}
