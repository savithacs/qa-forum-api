import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Voting } from './entities/voting.entity';
import { Repository } from 'typeorm';
import { QuestionsService } from 'src/questions/questions.service';

@Injectable()
export class VotingService {
  constructor(
    @InjectRepository(Voting)
    private readonly voting: Repository<Voting>,
    private readonly questionService: QuestionsService,
  ) { }

  async createVoting(voterId: string, questionId?: string, answerId?: string) {
    if ((questionId && answerId) || (!questionId && !answerId)) {
      throw new BadRequestException('Provide either questionId or answerId');
    }
    if (questionId) {
      await this.questionService.findByIdOrFailQuestion(questionId);

      const questionVote = await this.voting.findOne({
        where: {
          questionId,
          voterId,
        },
      });
      if (questionVote)
        throw new ConflictException(
          'Voting already exists for this question for you',
        );

      return this.voting.save(
        this.voting.create({
          voterId,
          questionId,
        }),
      );
    }
    if (answerId) {
      await this.questionService.findByIdOrFailAnswer(answerId);

      const answerVote = await this.voting.findOne({
        where: {
          answerId,
          voterId,
        },
      });
      if (answerVote)
        throw new ConflictException(
          'Voting already exists for this answer for you',
        );

      return this.voting.save(
        this.voting.create({
          voterId,
          answerId,
        }),
      );
    }
  }

  async removeVoting(id: string, voterId: string) {
    const voting = await this.voting.findOne({
      where: {
        id,
      },
    });
    if (!voting) {
      throw new NotFoundException('Voting not found');
    }
    if (voting.voterId != voterId) {
      throw new ForbiddenException('You can delete only your own voting');
    }

    return this.voting.delete(id);
  }
}
