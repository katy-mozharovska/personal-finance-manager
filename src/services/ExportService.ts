import { Activity } from '../models/Activity';
import { Category } from '../models/Category';

export class ExportService {
  public static exportJSON(
    categories: Category[],
    activities: Activity[]
  ): void {
    const backup = {
      exportedAt: new Date().toISOString(),
      categories: categories.map((category) => category.toJSON()),
      activities: activities.map((activity) => activity.toJSON())
    };

    const content = JSON.stringify(backup, null, 2);

    this.downloadFile(
      content,
      'pocket-ledger-backup.json',
      'application/json'
    );
  }

  public static exportCSV(
    categories: Category[],
    activities: Activity[]
  ): void {
    const categoryNames = new Map(
      categories.map((category) => [category.id, category.name])
    );

    const headers = [
      'ID',
      'Category',
      'Type',
      'Amount',
      'Date',
      'Description'
    ];

    const escapeCSV = (value: string | number): string => {
      const text = String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = activities.map((activity) => [
      activity.id,
      categoryNames.get(activity.categoryId) ?? 'Unknown category',
      activity.type,
      activity.amount.toFixed(2),
      activity.date,
      activity.description
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(','))
    ].join('\r\n');

    // BOM helps Excel recognize UTF-8 correctly.
    this.downloadFile(
      '\uFEFF' + csvContent,
      'pocket-ledger-activities.csv',
      'text/csv;charset=utf-8;'
    );
  }

  private static downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }
}