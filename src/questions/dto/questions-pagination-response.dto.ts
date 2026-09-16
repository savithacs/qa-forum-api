import { ApiProperty } from '@nestjs/swagger';
import { QuestionResponseDto } from './question-response.dto';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedQuestionsResponseDto {
  @ApiProperty({ type: [QuestionResponseDto] })
  data: QuestionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
