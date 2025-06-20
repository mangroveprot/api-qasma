import moment from 'moment';
import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from 'mongoose';
import { config } from '../../../config';

export class BaseRepository<T extends Document> {
  protected model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(input: Partial<T>): Promise<T> {
    const document = new this.model(input);
    return await document.save();
  }

  async findAll(
    query: FilterQuery<T> = {},
    options: QueryOptions = {},
    includeDeleted = false,
  ): Promise<T[]> {
    const effectiveQuery = includeDeleted
      ? query
      : { ...query, deletedAt: null };
    return await this.model.find(effectiveQuery, null, options).exec();
  }

  async findOne(
    query: FilterQuery<T>,
    options: QueryOptions = {},
    includeDeleted = false,
  ): Promise<T | null> {
    const effectiveQuery = includeDeleted
      ? query
      : { ...query, deletedAt: null };
    return await this.model.findOne(effectiveQuery, null, options).exec();
  }

  async update(
    query: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: QueryOptions = {},
    includeDeleted = false,
  ): Promise<T | null> {
    const effectiveQuery = includeDeleted
      ? query
      : { ...query, deletedAt: null };
    return await this.model
      .findOneAndUpdate(effectiveQuery, update, { new: true, ...options })
      .exec();
  }

  async delete(
    query: FilterQuery<T>,
    options: QueryOptions<T>,
    softDelete = true,
  ): Promise<T | null> {
    if (softDelete) {
      return await this.update(
        query,
        {
          $set: { deletedAt: moment.tz(config.timeZone).toDate() },
        } as UpdateQuery<T>,
        options,
        true,
      );
    }
    return await this.model.findOneAndDelete(query, options).exec();
  }

  async countDocuments(
    query: FilterQuery<T> = {},
    includeDeleted = false,
  ): Promise<number> {
    const effectiveQuery = includeDeleted
      ? query
      : { ...query, deletedAt: null };
    return await this.model.countDocuments(effectiveQuery).exec();
  }
}
