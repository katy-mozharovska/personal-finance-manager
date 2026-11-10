import { Activity, IActivityDto, OperationType } from '../models/Activity';
import { StorageService } from '../services/StorageService';

export class ActivityRepository {
  private readonly storageKey = 'pfm_activities';
  private activities: Map<string, Activity> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const rawList = StorageService.getItem<IActivityDto[]>(this.storageKey);

    if (rawList !== null) {
      rawList.forEach((dto) =>
        this.activities.set(dto.id, Activity.fromJSON(dto))
      );
    } else {
      // Default initial transactions
      this.save(new Activity('a-1', 'c-2', 'Expense', 45.00, '2026-09-07', 'Dinner at bistro'));
      this.save(new Activity('a-2', 'c-1', 'Expense', 200.00, '2026-09-07', 'Supermarket supplies'));
      this.save(new Activity('a-3', 'c-3', 'Expense', 200.00, '2026-09-08', 'Weekend hiking trip'));
      this.save(new Activity('a-4', 'c-2', 'Expense', 25.00, '2026-09-08', 'Lunch with colleagues'));
    }
  }

  private persist(): void {
    const dtoList = Array.from(this.activities.values()).map((a) => a.toJSON());
    StorageService.setItem(this.storageKey, dtoList);
  }

  public getAll(): Activity[] {
    return Array.from(this.activities.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  public getById(id: string): Activity | null {
    return this.activities.get(id) ?? null;
  }

  public save(activity: Activity): void {
    this.activities.set(activity.id, activity);
    this.persist();
  }

  public delete(id: string): boolean {
    const res = this.activities.delete(id);
    if (res) this.persist();
    return res;
  }

  public filter(categoryId?: string, type?: OperationType, startDate?: string, endDate?: string): Activity[] {
    return this.getAll().filter((item) => {
      if (categoryId && item.categoryId !== categoryId) return false;
      if (type && item.type !== type) return false;
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;
      return true;
    });
  }
}