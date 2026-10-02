import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';
import { QuestionTag } from './entities/questionTag.entity';
import { AnswerTag } from './entities/answerTag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tags: Repository<Tag>,
    @InjectRepository(QuestionTag)
    private readonly questionTags: Repository<QuestionTag>,
    @InjectRepository(AnswerTag)
    private readonly answerTags: Repository<AnswerTag>,
  ) { }

  async addTag(tagName: string): Promise<Tag> {
    const normalizedName = tagName.trim().toLowerCase();
    const tag = await this.tags.findOne({
      where: {
        tagName: normalizedName,
      },
    });

    if (!tag) {
      return this.tags.save(this.tags.create({ tagName: normalizedName }));
    }
    return tag;
  }

  async addQuestionTag(tagName: string, questionId: string) {
    const tag = await this.addTag(tagName);
    const quesTag = await this.questionTags.findOne({
      where: {
        tagId: tag.id,
        questionId,
      },
    });
    if (!quesTag)
      return this.questionTags.save(
        this.questionTags.create({
          tagId: tag.id,
          questionId,
        }),
      );

    return quesTag;
  }

  async addAnswerTag(tagName: string, answerId: string) {
    const tag = await this.addTag(tagName);
    const answerTag = await this.answerTags.findOne({
      where: {
        tagId: tag.id,
        answerId,
      },
    });
    if (!answerTag)
      return this.answerTags.save(
        this.answerTags.create({
          tagId: tag.id,
          answerId,
        }),
      );
    return answerTag;
  }

  async updateQuestionTags(questionId: string, tagNames: string[]) {
    const normalizedNames = [
      ...new Set(tagNames.map((name) => name.trim().toLowerCase())),
    ];

    const existingRelations = await this.questionTags.find({
      where: { questionId },
      relations: { tag: true },
    });

    const existingNames = new Set(
      existingRelations.map((relation) => relation.tag.tagName),
    );

    // Remove tags that are no longer present
    const relationsToRemove = existingRelations.filter(
      (relation) => !normalizedNames.includes(relation.tag.tagName),
    );

    if (relationsToRemove.length) {
      await this.questionTags.remove(relationsToRemove);
    }

    // Add only new tags
    for (const tagName of normalizedNames) {
      if (!existingNames.has(tagName)) {
        await this.addQuestionTag(tagName, questionId);
      }
    }
  }

  async updateAnswerTags(answerId: string, tagNames: string[]) {
    const normalizedNames = [
      ...new Set(tagNames.map((name) => name.trim().toLowerCase())),
    ];

    const existingRelations = await this.answerTags.find({
      where: { answerId },
      relations: { tag: true },
    });

    const existingNames = new Set(
      existingRelations.map((relation) => relation.tag.tagName),
    );

    // Remove tags that are no longer present
    const relationsToRemove = existingRelations.filter(
      (relation) => !normalizedNames.includes(relation.tag.tagName),
    );

    if (relationsToRemove.length) {
      await this.answerTags.remove(relationsToRemove);
    }

    // Add only new tags
    for (const tagName of normalizedNames) {
      if (!existingNames.has(tagName)) {
        await this.addAnswerTag(tagName, answerId);
      }
    }
  }
}
