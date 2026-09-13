import { Module } from '@nestjs/common';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voting } from './entities/voting.entity';
import { QuestionsModule } from 'src/questions/questions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voting]), QuestionsModule],
  controllers: [VotingController],
  providers: [VotingService],
})
export class VotingModule { }
