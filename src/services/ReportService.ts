import { Activity, OperationType } from '../models/Activity';
import { CategoryRepository } from '../repositories/CategoryRepository';

export interface ICategoryReportItem {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

export interface IDayReportItem {
  date: string;
  totalAmount: number;
}

export class ReportService {
  constructor(private categoryRepo: CategoryRepository) {}

  public generateCategoryReport(
    activities: Activity[],
    type: OperationType,
    startDate: string,
    endDate: string
  ): { items: ICategoryReportItem[]; grandTotal: number } {
    const filtered = activities.filter(
      (a) => a.type === type && a.date >= startDate && a.date <= endDate
    );

    const totalsByCategory = new Map<string, number>();
    let grandTotal = 0;

    for (const act of filtered) {
      const current = totalsByCategory.get(act.categoryId) || 0;
      totalsByCategory.set(act.categoryId, current + act.amount);
      grandTotal += act.amount;
    }

    const items: ICategoryReportItem[] = [];

    totalsByCategory.forEach((sum, catId) => {
      const cat = this.categoryRepo.getById(catId);
      const categoryName = cat ? cat.name : 'Deleted Category';
      const percentage = grandTotal > 0 ? Number(((sum / grandTotal) * 100).toFixed(1)) : 0;

      items.push({
        categoryId: catId,
        categoryName,
        totalAmount: Number(sum.toFixed(2)),
        percentage
      });
    });

    items.sort((a, b) => b.totalAmount - a.totalAmount);

    return { items, grandTotal: Number(grandTotal.toFixed(2)) };
  }

  public generateDayByDayReport(
    activities: Activity[],
    type: OperationType,
    startDate: string,
    endDate: string
  ): IDayReportItem[] {
    const filtered = activities.filter(
      (a) => a.type === type && a.date >= startDate && a.date <= endDate
    );

    const totalsByDay = new Map<string, number>();

    for (const act of filtered) {
      const current = totalsByDay.get(act.date) || 0;
      totalsByDay.set(act.date, current + act.amount);
    }

    const result: IDayReportItem[] = [];
    totalsByDay.forEach((totalAmount, date) => {
      result.push({ date, totalAmount: Number(totalAmount.toFixed(2)) });
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }
}