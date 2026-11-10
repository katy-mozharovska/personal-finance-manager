export interface ICategoryDto {
  id: string;
  name: string;
  description: string;
}

export class Category {
  private _id: string;
  private _name!: string;
  private _description: string;

  constructor(id: string, name: string, description: string = '') {
    this._id = id;
    this.name = name;
    this._description = description.trim();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error('Category name cannot be empty.');
    }
    this._name = trimmed;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value.trim();
  }

  public toJSON(): ICategoryDto {
    return {
      id: this._id,
      name: this._name,
      description: this._description
    };
  }

  public static fromJSON(dto: ICategoryDto): Category {
    return new Category(dto.id, dto.name, dto.description);
  }
}