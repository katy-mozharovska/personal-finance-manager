
export type OperationType = 'Expense' | 'Revenue';

export interface IActivityDto {
  id: string;
  categoryId: string;
  type: OperationType;
  amount: number;
  date: string; // Format: YYYY-MM-DD
  description: string;
}

export class Activity {
  private _id: string;
  private _categoryId!: string;
  private _type!: OperationType;
  private _amount!: number;
  private _date!: string;
  private _description!: string;

  constructor(
    id: string,
    categoryId: string,
    type: OperationType,
    amount: number,
    date: string,
    description: string = ''
  ) {
    this._id = id;
    this.categoryId = categoryId;
    this.type = type;
    this.amount = amount;
    this.date = date;
    this.description = description;
  }

  get id(): string {
    return this._id;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  set categoryId(val: string) {
    if (!val) {
      throw new Error('Category is required for a transaction.');
    }

    this._categoryId = val;
  }

  get type(): OperationType {
    return this._type;
  }

  set type(val: OperationType) {
    if (val !== 'Expense' && val !== 'Revenue') {
      throw new Error('Invalid operation type.');
    }

    this._type = val;
  }

  get amount(): number {
    return this._amount;
  }

  set amount(value: number) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('Amount must be a positive number greater than zero.');
    }

    this._amount = Number(value.toFixed(2));
  }

  get date(): string {
    return this._date;
  }

  set date(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD.');
    }

    const [year, month, day] = value.split('-').map(Number);

    const isLeapYear =
      year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

    const daysInMonth = [
      31,
      isLeapYear ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31
    ];

    if (
      year < 1 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > daysInMonth[month - 1]
    ) {
      throw new Error('Invalid calendar date.');
    }

    this._date = value;
  }

  get description(): string {
    return this._description;
  }

  set description(val: string) {
    this._description = val.trim();
  }

  public toJSON(): IActivityDto {
    return {
      id: this._id,
      categoryId: this._categoryId,
      type: this._type,
      amount: this._amount,
      date: this._date,
      description: this._description
    };
  }

  public static fromJSON(dto: IActivityDto): Activity {
    return new Activity(
      dto.id,
      dto.categoryId,
      dto.type,
      dto.amount,
      dto.date,
      dto.description
    );
  }
}
