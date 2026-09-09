import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entities/questions.entity';
import { Repository } from 'typeorm';
import { Answer } from './entities/answers.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questions: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answers: Repository<Answer>,
  ) {}

  findAll() {
    return this.questions.find({
      relations: {
        owner: true,
      },
    });
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
