import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/paging.dto';

export class QuestionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
