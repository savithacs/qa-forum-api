import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';
import { QuestionTag } from './entities/questionTag.entity';
import { AnswerTag } from './entities/answerTag.entity';

describe('TagsService', () => {
  let service: TagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(Tag), useValue: {} },
        { provide: getRepositoryToken(QuestionTag), useValue: {} },
        { provide: getRepositoryToken(AnswerTag), useValue: {} },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
