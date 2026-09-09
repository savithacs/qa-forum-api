import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionResponseDto } from './dto/question-response.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { type AuthenticatedRequest } from 'src/auth/types/auth.types';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AnswerResponseDto } from './dto/answer-response.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) { }

  @ApiOkResponse({ type: [QuestionResponseDto] })
  @Get()
  async findAllQuestions() {
    const questions = await this.questionsService.findAll();
    return questions.map((question) =>
      QuestionResponseDto.fromEntity(question),
    );
  }

  @ApiOkResponse({ type: QuestionResponseDto })
  @Get(':id')
  async findQuestionById(@Param('id', ParseUUIDPipe) id: string) {
    const question = await this.questionsService.findById(id);
    return QuestionResponseDto.fromEntity(question);
  }

  @ApiCreatedResponse({ type: QuestionResponseDto })
  @Post()
  async createQuestion(
    @Body() dto: CreateQuestionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const question = await this.questionsService.createQuestion(
      dto,
      req.user.id,
    );
    return QuestionResponseDto.fromEntity(question);
  }

  @ApiOkResponse({
    schema: {
      example: {
        generatedMaps: [],
        raw: [],
        affected: 1,
      },
    },
  })
  @Patch(':id')
  updateQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.questionsService.updateQuestion(id, dto, req.user.id);
  }

  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.questionsService.deleteQuestion(id, req.user.id);
  }

  @ApiCreatedResponse({ type: AnswerResponseDto })
  @Post(':id/answers')
  async createAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAnswerDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const answer = await this.questionsService.createAnswer(
      id,
      dto,
      req.user.id,
    );
    return AnswerResponseDto.fromEntity(answer);
  }

  @Patch('answers/:answerid')
  updateAnswer(
    @Param('answerid', ParseUUIDPipe) id: string,
    @Body() dto: CreateAnswerDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.questionsService.updateAnswer(id, dto, req.user.id);
  }

  @ApiNoContentResponse()
  @Delete('answers/:answerid')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAnswer(
    @Param('answerid', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.questionsService.deleteAnswer(id, req.user.id);
  }
}
