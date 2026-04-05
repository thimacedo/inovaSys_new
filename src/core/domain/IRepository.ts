export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface IRepository<T, InsertDTO, UpdateDTO> {
  findById(id: string): Promise<T | null>;
  findAll(options?: PaginationOptions): Promise<T[]>;
  create(data: InsertDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
