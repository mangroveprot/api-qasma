import { Document } from 'mongoose';
import { BaseRepository } from '../_repositories/base.repostitories';
import { ErrorResponse } from '../../../../common/shared/utils';
import {
  ErrorResponseType,
  SuccessResponseType,
} from '../../../../common/shared/types';
import { escapeRegex } from '../../../../helpers/string';

export class BaseService<T extends Document, R extends BaseRepository<T>> {
  protected repository: R;
  protected searchFields?: string[];
  protected allowedFilterFields?: string[];
  protected uniqueFields: string[];
  protected populateFields: string[];

  constructor(repository: R, populateFields: string[] = []) {
    this.repository = repository;
    this.uniqueFields = this.detectUniqueFields();
    this.populateFields = populateFields;
  }

  private detectUniqueFields(): string[] {
    const uniqueFields: string[] = [];
    for (const path in this.repository['model'].schema.paths) {
      if (this.repository['model'].schema.paths[path].options?.unique) {
        uniqueFields.push(path);
      }
    }
    return uniqueFields;
  }

  private filterQueryFields(query: Record<string, any>): Record<string, any> {
    const filteredQuery: Record<string, any> = {};
    Object.keys(query)
      .filter((key) => this.allowedFilterFields?.includes(key))
      .forEach((key) => {
        filteredQuery[key] = query[key];
      });
    return filteredQuery;
  }

  private async ensureUniqueField(
    doc: Partial<T>,
    field: keyof T,
  ): Promise<void> {
    if (!doc[field]) return;
    const exists = await this.repository.findOne({
      [field]: doc[field],
      _id: { $ne: doc['_id'] },
    } as any);
    if (exists) {
      throw new ErrorResponse(
        'UNIQUE_FIELD_ERROR',
        `The ${String(field)} must be unique.`,
        [`Choose a different ${String(field)}.`],
      );
    }
  }

  async create(input: Partial<T>): Promise<any> {
    try {
      const document = await this.repository.create(input);
      return {
        success: true,
        document,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('DATABASE_ERROR', (error as Error).message),
      };
    }
  }

  async findOne(
    query: Record<string, any>,
    includeDeleted = false,
  ): Promise<SuccessResponseType<T> | ErrorResponseType> {
    try {
      const document = await this.repository.findOne(query, {}, includeDeleted);
      if (!document) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'The requested document was not found.',
        );
      }
      return { success: true, document };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('DATABASE_ERROR', (error as Error).message),
      };
    }
  }

  async findAll({
    query = {},
    sort = {},
    page = 1,
    limit = 10,
    searchTerm = '',
    paginate = true,
    includeDeleted = false,
  }: {
    query?: Record<string, any>;
    sort?: Record<string, any>;
    page?: number;
    limit?: number;
    searchTerm?: string;
    paginate?: boolean;
    includeDeleted?: boolean;
  } = {}): Promise<SuccessResponseType<T> | ErrorResponseType> {
    try {
      let searchQuery = this.filterQueryFields(query);
      if (searchTerm && this.searchFields?.length) {
        const regex = new RegExp(escapeRegex(searchTerm), 'i');
        const searchConditions = this.searchFields.map((field) => ({
          [field]: regex,
        }));
        searchQuery = { ...searchQuery, $or: searchConditions };
      }
      const documents = await this.repository.findAll(
        searchQuery,
        {
          sort,
          skip: (page - 1) * limit,
          limit: paginate ? limit : undefined,
        },
        includeDeleted,
      );
      const total = await this.repository.countDocuments({}, includeDeleted);
      const _results = await this.repository.countDocuments(
        searchQuery,
        includeDeleted,
      );
      const results = paginate ? documents.length : total;
      return {
        success: true,
        total,
        _results,
        results,
        documents,
        page: paginate ? page : undefined,
        limit: paginate ? limit : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('DATABASE_ERROR', (error as Error).message),
      };
    }
  }

  async update(
    query: Record<string, any>,
    updateInput: Partial<T>,
    includeDeleted = false,
  ): Promise<SuccessResponseType<T> | ErrorResponseType> {
    try {
      const documentToUpdate = await this.repository.findOne(
        query,
        {},
        includeDeleted,
      );
      if (!documentToUpdate) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'Document to update not found.',
        );
      }
      const fieldsToUpdate: Partial<T> = {};
      for (const key in updateInput) {
        if (updateInput[key] !== documentToUpdate[key]) {
          fieldsToUpdate[key as keyof T] = updateInput[key];
        }
      }
      for (const field of this.uniqueFields) {
        if (
          fieldsToUpdate[field as keyof T] &&
          fieldsToUpdate[field as keyof T] !==
            documentToUpdate[field as keyof T]
        ) {
          await this.ensureUniqueField(fieldsToUpdate, field as keyof T);
        }
      }
      const updatedDocument = await this.repository.update(
        query,
        fieldsToUpdate,
        {},
        includeDeleted,
      );
      if (!updatedDocument) {
        throw new ErrorResponse(
          'NOT_FOUND_ERROR',
          'Updated document not found.',
        );
      }
      return { success: true, document: updatedDocument };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse('DATABASE_ERROR', (error as Error).message),
      };
    }
  }
}
