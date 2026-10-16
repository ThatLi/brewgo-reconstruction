import type {
  Category,
  CategoryId,
  Coupon,
  ModifierGroup,
  ModifierGroupId,
  ModifierOption,
  ModifierOptionId,
  Product,
  ProductId,
  Result,
  Store,
  StoreId,
} from "@/domain/types";

export interface StoreRepository {
  list(): Promise<Result<readonly Store[]>>;
  getById(id: StoreId): Promise<Result<Store>>;
}
export interface CatalogRepository {
  listCategories(): Promise<Result<readonly Category[]>>;
  listProducts(categoryId?: CategoryId): Promise<Result<readonly Product[]>>;
  searchProducts(query: string): Promise<Result<readonly Product[]>>;
  getProduct(id: ProductId): Promise<Result<Product>>;
  getModifierGroups(ids: readonly ModifierGroupId[]): Promise<Result<readonly ModifierGroup[]>>;
  getModifierOptions(ids: readonly ModifierOptionId[]): Promise<Result<readonly ModifierOption[]>>;
}
export interface CouponRepository {
  listAvailable(at: string): Promise<Result<readonly Coupon[]>>;
  findByCode(code: string): Promise<Result<Coupon>>;
}
