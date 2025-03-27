export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}

export interface SearchOptions extends PaginationOptions {
  query?: string;
  filters?: Record<string, any>;
  sort?: SortOptions;
}
