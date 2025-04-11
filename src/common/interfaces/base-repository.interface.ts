export default interface IBaseRepository<T, FindArgs, CreateArgs> {
  findFirst(params: FindArgs): Promise<T | null>;
  findUnique(param: FindArgs): Promise<T | null>;
  findMany?(param: FindArgs): Promise<any>;
  count?(params: FindArgs): Promise<number>;
  create(params: CreateArgs): Promise<T>;
  delete(params: FindArgs): Promise<void>;
}
