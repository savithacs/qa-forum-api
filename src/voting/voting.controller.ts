import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
} from '@nestjs/common';
import { VotingService } from './voting.service';
import { ApiCreatedResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { VotingResponseDto } from './dto/voting-response.dto';
import { CreateVotingDto } from './dto/create-voting.dto';
import { type AuthenticatedRequest } from 'src/auth/types/auth.types';

@Controller('voting')
export class VotingController {
  constructor(private readonly votingService: VotingService) { }

  @ApiCreatedResponse({ type: VotingResponseDto })
  @Post()
  async createVoting(
    @Body() dto: CreateVotingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const voting = await this.votingService.createVoting(
      req.user.id,
      dto.questionId,
      dto.answerId,
    );
    return VotingResponseDto.fromEntity(voting);
  }

  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteVoting(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.votingService.removeVoting(id, req.user.id);
  }
}
