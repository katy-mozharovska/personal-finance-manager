import { Category, ICategoryDto } from '../models/Category';
import { StorageService } from '../services/StorageService';

export class CategoryRepository {
  private readonly storageKey = 'pfm_categories';
  private categories: Map<string, Category> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const rawList = StorageService.getItem<ICategoryDto[]>(this.storageKey);

    if (rawList !== null) {
      rawList.forEach((dto) =>
        this.categories.set(dto.id, Category.fromJSON(dto))
      );
    } else {
      // Default initial categories
      this.save(new Category('c-1', 'Groceries', 'Household grocery expenses'));
      this.save(new Category('c-2', 'Dining Out', 'Restaurants, cafes, and coffee shops'));
      this.save(new Category('c-3', 'Entertainment', 'Movies, hobbies, and leisure activities'));
    }
  }

  private persist(): void {
    const dtoList = Array.from(this.categories.values()).map((c) => c.toJSON());
    StorageService.setItem(this.storageKey, dtoList);
  }

  public getAll(): Category[] {
    return Array.from(this.categories.values());
  }

  public getById(id: string): Category | null {
    return this.categories.get(id) ?? null;
  }

  public save(category: Category): void {
    this.categories.set(category.id, category);
    this.persist();
  }

  public delete(id: string): boolean {
    const deleted = this.categories.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  public searchByName(query: string): Category[] {
    const lower = query.toLowerCase().trim();
    if (!lower) return this.getAll();
    return this.getAll().filter((c) => c.name.toLowerCase().includes(lower));
  }
}