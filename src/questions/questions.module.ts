import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/questions.entity';
import { Answer } from './entities/answers.entity';
import { Voting } from 'src/voting/entities/voting.entity';
import { TagsModule } from 'src/tags/tags.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer, Voting]), TagsModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule { }
