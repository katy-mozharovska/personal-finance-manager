
import { Modal } from 'bootstrap';

import { Category } from './models/Category';
import { Activity, OperationType } from './models/Activity';
import { CategoryRepository } from './repositories/CategoryRepository';
import { ActivityRepository } from './repositories/ActivityRepository';
import { ReportService } from './services/ReportService';
import { ExportService } from './services/ExportService';

declare const Highcharts: any;

class AppController {
  private categoryRepo = new CategoryRepository();
  private activityRepo = new ActivityRepository();
  private reportService = new ReportService(this.categoryRepo);

  private categoryModal!: Modal;
  private activityModal!: Modal;

  private categoryChart: any = null;

  constructor() {
    this.initModals();
    this.bindNavigation();
    this.bindCategoryEvents();
    this.bindActivityEvents();
    this.bindReportEvents();
    this.bindExportEvents();

    this.renderCategoriesTable();
    this.renderActivitiesTable();
    this.populateCategoryDropdowns();
    this.setDefaultReportDates();
  }

  // Returns today's date in local YYYY-MM-DD format.
  private getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // --- Initialization ---

  private initModals(): void {
    const categoryModalElement = document.getElementById('categoryModal');
    const activityModalElement = document.getElementById('activityModal');

    if (!categoryModalElement || !activityModalElement) {
      throw new Error('Modal elements were not found in index.html');
    }

    this.categoryModal = new Modal(categoryModalElement);
    this.activityModal = new Modal(activityModalElement);
  }

  // --- Navigation ---

  private bindNavigation(): void {
    const secCategories = document.getElementById('section-categories')!;
    const secActivities = document.getElementById('section-activities')!;
    const secReports = document.getElementById('section-reports')!;

    const btnCat = document.getElementById('nav-categories-btn')!;
    const btnAct = document.getElementById('nav-activities-btn')!;
    const btnRep = document.getElementById('nav-reports-btn')!;

    const switchSection = (
      activeSection: HTMLElement,
      activeButton: HTMLElement
    ): void => {
      [secCategories, secActivities, secReports].forEach((section) => {
        section.classList.add('d-none');
      });

      [btnCat, btnAct, btnRep].forEach((button) => {
        button.classList.remove('active');
      });

      activeSection.classList.remove('d-none');
      activeButton.classList.add('active');
    };

    btnCat.addEventListener('click', () => {
      switchSection(secCategories, btnCat);
    });

    btnAct.addEventListener('click', () => {
      switchSection(secActivities, btnAct);
    });

    btnRep.addEventListener('click', () => {
      switchSection(secReports, btnRep);
    });
  }

  // --- Categories Management ---

  private bindCategoryEvents(): void {
    const searchInput = document.getElementById(
      'search-category-input'
    ) as HTMLInputElement;

    searchInput.addEventListener('input', () => {
      const filteredCategories = this.categoryRepo.searchByName(
        searchInput.value
      );

      this.renderCategoriesTable(filteredCategories);
    });

    const openModalButton = document.getElementById(
      'btn-open-category-modal'
    )!;

    openModalButton.addEventListener('click', () => {
      const form = document.getElementById(
        'category-form'
      ) as HTMLFormElement;

      form.reset();

      (document.getElementById('category-id-input') as HTMLInputElement).value =
        '';

      document.getElementById('categoryModalTitle')!.textContent =
        'Add New Category';

      this.categoryModal.show();
    });

    const categoryForm = document.getElementById(
      'category-form'
    ) as HTMLFormElement;

    categoryForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const idInput = (
        document.getElementById('category-id-input') as HTMLInputElement
      ).value;

      const nameInput = (
        document.getElementById('category-name-input') as HTMLInputElement
      ).value;

      const descriptionInput = (
        document.getElementById('category-desc-input') as HTMLTextAreaElement
      ).value;

      try {
        const id = idInput || `cat-${Date.now()}`;

        const category = new Category(
          id,
          nameInput,
          descriptionInput
        );

        this.categoryRepo.save(category);

        this.categoryModal.hide();

        this.renderCategoriesTable();
        this.populateCategoryDropdowns();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Could not save category';

        alert(message);
      }
    });
  }

  private renderCategoriesTable(
    categories: Category[] = this.categoryRepo.getAll()
  ): void {
    const tbody = document.getElementById(
      'categories-table-body'
    )!;

    tbody.innerHTML = '';

    if (categories.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted">
            No categories found
          </td>
        </tr>
      `;

      return;
    }

    categories.forEach((category, index) => {
      const row = document.createElement('tr');

      const numberCell = document.createElement('td');
      numberCell.textContent = String(index + 1);

      const nameCell = document.createElement('td');
      nameCell.className = 'fw-bold';
      nameCell.textContent = category.name;

      const descriptionCell = document.createElement('td');
      descriptionCell.textContent = category.description || '—';

      if (!category.description) {
        descriptionCell.classList.add('text-muted');
      }

      const actionsCell = document.createElement('td');
      actionsCell.className = 'text-center';

      const editButton = document.createElement('button');
      editButton.className =
        'btn btn-sm btn-outline-secondary me-1';
      editButton.innerHTML = '<i class="bi bi-pencil"></i>';
      editButton.type = 'button';
      editButton.title = 'Edit category';

      editButton.addEventListener('click', () => {
        this.editCategory(category.id);
      });

      const deleteButton = document.createElement('button');
      deleteButton.className =
        'btn btn-sm btn-outline-danger';
      deleteButton.innerHTML = '<i class="bi bi-x-lg"></i>';
      deleteButton.type = 'button';
      deleteButton.title = 'Delete category';

      deleteButton.addEventListener('click', () => {
        this.deleteCategory(category.id);
      });

      actionsCell.append(editButton, deleteButton);

      row.append(
        numberCell,
        nameCell,
        descriptionCell,
        actionsCell
      );

      tbody.appendChild(row);
    });
  }

  private editCategory(id: string): void {
    const category = this.categoryRepo.getById(id);

    if (!category) {
      return;
    }

    (document.getElementById('category-id-input') as HTMLInputElement).value =
      category.id;

    (document.getElementById('category-name-input') as HTMLInputElement).value =
      category.name;

    (document.getElementById('category-desc-input') as HTMLTextAreaElement).value =
      category.description;

    document.getElementById('categoryModalTitle')!.textContent =
      'Edit Category';

    this.categoryModal.show();
  }

  private deleteCategory(id: string): void {
    const relatedActivities = this.activityRepo
      .getAll()
      .filter((activity) => activity.categoryId === id);

    if (relatedActivities.length > 0) {
      alert(
        `This category cannot be deleted because it has ${relatedActivities.length} associated transaction(s).`
      );

      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryRepo.delete(id);

      this.renderCategoriesTable();
      this.populateCategoryDropdowns();
    }
  }

  // --- Activities Management ---

  private bindActivityEvents(): void {
    const openModalButton = document.getElementById(
      'btn-open-activity-modal'
    )!;

    openModalButton.addEventListener('click', () => {
      const form = document.getElementById(
        'activity-form'
      ) as HTMLFormElement;

      form.reset();

      (document.getElementById('activity-id-input') as HTMLInputElement).value =
        '';

      (document.getElementById('activity-date-input') as HTMLInputElement).value =
        this.getLocalDateString();

      document.getElementById('activityModalTitle')!.textContent =
        'Add New Transaction';

      this.activityModal.show();
    });

    const activityForm = document.getElementById(
      'activity-form'
    ) as HTMLFormElement;

    activityForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const idInput = (
        document.getElementById('activity-id-input') as HTMLInputElement
      ).value;

      const categoryIdInput = (
        document.getElementById('activity-category-select') as HTMLSelectElement
      ).value;

      const typeInput = (
        document.getElementById('activity-type-select') as HTMLSelectElement
      ).value as OperationType;

      const amountInput = Number(
        (document.getElementById('activity-amount-input') as HTMLInputElement)
          .value
      );

      const dateInput = (
        document.getElementById('activity-date-input') as HTMLInputElement
      ).value;

      const descriptionInput = (
        document.getElementById('activity-desc-input') as HTMLInputElement
      ).value;

      try {
        const id = idInput || `act-${Date.now()}`;

        const activity = new Activity(
          id,
          categoryIdInput,
          typeInput,
          amountInput,
          dateInput,
          descriptionInput
        );

        this.activityRepo.save(activity);

        this.activityModal.hide();
        this.renderActivitiesTable();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Could not save activity';

        alert(message);
      }
    });

    // Filtering
    const filterCategory = document.getElementById(
      'filter-activity-category'
    ) as HTMLSelectElement;

    const filterType = document.getElementById(
      'filter-activity-type'
    ) as HTMLSelectElement;

    const resetButton = document.getElementById(
      'btn-reset-filters'
    )!;

    const applyFilters = (): void => {
      const categoryId = filterCategory.value || undefined;

      const type = filterType.value
        ? (filterType.value as OperationType)
        : undefined;

      const filteredActivities = this.activityRepo.filter(
        categoryId,
        type
      );

      this.renderActivitiesTable(filteredActivities);
    };

    filterCategory.addEventListener('change', applyFilters);
    filterType.addEventListener('change', applyFilters);

    resetButton.addEventListener('click', () => {
      filterCategory.value = '';
      filterType.value = '';

      this.renderActivitiesTable();
    });
  }

  private renderActivitiesTable(
    activities: Activity[] = this.activityRepo.getAll()
  ): void {
    const tbody = document.getElementById(
      'activities-table-body'
    )!;

    tbody.innerHTML = '';

    if (activities.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted">
            No transactions found
          </td>
        </tr>
      `;

      return;
    }

    activities.forEach((activity, index) => {
      const category = this.categoryRepo.getById(activity.categoryId);

      const row = document.createElement('tr');

      const numberCell = document.createElement('td');
      numberCell.textContent = String(index + 1);

      const categoryCell = document.createElement('td');
      categoryCell.className = 'fw-bold';
      categoryCell.textContent = category
        ? category.name
        : 'Unknown Category';

      const typeCell = document.createElement('td');
      const typeBadge = document.createElement('span');

      typeBadge.className =
        activity.type === 'Expense'
          ? 'badge bg-danger'
          : 'badge bg-success';

      typeBadge.textContent = activity.type;
      typeCell.appendChild(typeBadge);

      const amountCell = document.createElement('td');
      amountCell.className = 'fw-bold';
      amountCell.textContent = activity.amount.toFixed(2);

      const dateCell = document.createElement('td');
      dateCell.textContent = activity.date;

      const descriptionCell = document.createElement('td');
      descriptionCell.textContent = activity.description || '—';

      if (!activity.description) {
        descriptionCell.classList.add('text-muted');
      }

      const actionsCell = document.createElement('td');
      actionsCell.className = 'text-center';

      const editButton = document.createElement('button');
      editButton.className =
        'btn btn-sm btn-outline-secondary me-1';
      editButton.innerHTML = '<i class="bi bi-pencil"></i>';
      editButton.type = 'button';
      editButton.title = 'Edit activity';

      editButton.addEventListener('click', () => {
        this.editActivity(activity.id);
      });

      const deleteButton = document.createElement('button');
      deleteButton.className =
        'btn btn-sm btn-outline-danger';
      deleteButton.innerHTML = '<i class="bi bi-x-lg"></i>';
      deleteButton.type = 'button';
      deleteButton.title = 'Delete activity';

      deleteButton.addEventListener('click', () => {
        this.deleteActivity(activity.id);
      });

      actionsCell.append(editButton, deleteButton);

      row.append(
        numberCell,
        categoryCell,
        typeCell,
        amountCell,
        dateCell,
        descriptionCell,
        actionsCell
      );

      tbody.appendChild(row);
    });
  }

  private editActivity(id: string): void {
    const activity = this.activityRepo.getById(id);

    if (!activity) {
      return;
    }

    (document.getElementById('activity-id-input') as HTMLInputElement).value =
      activity.id;

    (document.getElementById('activity-category-select') as HTMLSelectElement).value =
      activity.categoryId;

    (document.getElementById('activity-type-select') as HTMLSelectElement).value =
      activity.type;

    (document.getElementById('activity-amount-input') as HTMLInputElement).value =
      activity.amount.toString();

    (document.getElementById('activity-date-input') as HTMLInputElement).value =
      activity.date;

    (document.getElementById('activity-desc-input') as HTMLInputElement).value =
      activity.description;

    document.getElementById('activityModalTitle')!.textContent =
      'Edit Transaction';

    this.activityModal.show();
  }

  private deleteActivity(id: string): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.activityRepo.delete(id);
      this.renderActivitiesTable();
    }
  }

  // --- Category Dropdowns ---

  private populateCategoryDropdowns(): void {
    const modalSelect = document.getElementById(
      'activity-category-select'
    ) as HTMLSelectElement;

    const filterSelect = document.getElementById(
      'filter-activity-category'
    ) as HTMLSelectElement;

    const categories = this.categoryRepo.getAll();

    modalSelect.innerHTML = categories
      .map((category) => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        return option.outerHTML;
      })
      .join('');

    filterSelect.innerHTML = '<option value="">All Categories</option>';

    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      filterSelect.appendChild(option);
    });
  }

  // --- Reports ---

  private setDefaultReportDates(): void {
    const today = new Date();

    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const lastDay = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );

    (document.getElementById('report-start-date') as HTMLInputElement).value =
      this.getLocalDateString(firstDay);

    (document.getElementById('report-end-date') as HTMLInputElement).value =
      this.getLocalDateString(lastDay);
  }

  private bindReportEvents(): void {
    const form = document.getElementById(
      'report-form'
    ) as HTMLFormElement;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const startDate = (
        document.getElementById('report-start-date') as HTMLInputElement
      ).value;

      const endDate = (
        document.getElementById('report-end-date') as HTMLInputElement
      ).value;

      const type = (
        document.getElementById('report-type') as HTMLSelectElement
      ).value as OperationType;

      if (startDate > endDate) {
        alert('Start date cannot be later than end date.');
        return;
      }

      this.generateReport(startDate, endDate, type);
    });
  }

  private generateReport(
    startDate: string,
    endDate: string,
    type: OperationType
  ): void {
    const container = document.getElementById(
      'report-result-container'
    )!;

    const headerText = document.getElementById(
      'report-header-text'
    )!;

    const tableBody = document.getElementById(
      'report-table-body'
    )!;

    const grandTotalElement = document.getElementById(
      'report-grand-total'
    )!;

    const daysList = document.getElementById(
      'report-days-list'
    )!;

    container.classList.remove('d-none');

    headerText.textContent =
      `Report period: ${startDate} to ${endDate} ` +
      `(${type === 'Expense' ? 'Expenses' : 'Revenues'})`;

    const activities = this.activityRepo.getAll();

    const categoryReport = this.reportService.generateCategoryReport(
      activities,
      type,
      startDate,
      endDate
    );

    const dayReport = this.reportService.generateDayByDayReport(
      activities,
      type,
      startDate,
      endDate
    );

    this.renderCategoryChart(categoryReport.items, type);

    // Category breakdown table
    tableBody.innerHTML = '';

    if (categoryReport.items.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted">
            No records for this period
          </td>
        </tr>
      `;
    } else {
      categoryReport.items.forEach((item) => {
        const row = document.createElement('tr');

        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.categoryName;

        const amountCell = document.createElement('td');
        amountCell.className = 'text-end';
        amountCell.textContent = item.totalAmount.toFixed(2);

        const percentageCell = document.createElement('td');
        percentageCell.className = 'text-end';
        percentageCell.textContent = `${item.percentage}%`;

        row.append(
          categoryCell,
          amountCell,
          percentageCell
        );

        tableBody.appendChild(row);
      });
    }

    grandTotalElement.textContent =
      categoryReport.grandTotal.toFixed(2);

    // Day-by-day timeline
    daysList.innerHTML = '';

    if (dayReport.length === 0) {
      daysList.innerHTML = `
        <li class="list-group-item text-muted text-center">
          No daily records
        </li>
      `;
    } else {
      dayReport.forEach((day) => {
        const listItem = document.createElement('li');

        listItem.className =
          'list-group-item d-flex justify-content-between align-items-center';

        const dateLabel = document.createElement('span');
        dateLabel.innerHTML =
          '<i class="bi bi-calendar-event me-2"></i>';

        dateLabel.appendChild(
          document.createTextNode(day.date)
        );

        const amountLabel = document.createElement('span');
        amountLabel.className = 'badge bg-primary rounded-pill';
        amountLabel.textContent =
          `$${day.totalAmount.toFixed(2)}`;

        listItem.append(dateLabel, amountLabel);
        daysList.appendChild(listItem);
      });
    }
  }

  // --- Chart ---

  private renderCategoryChart(
    items: {
      categoryName: string;
      totalAmount: number;
      percentage: number;
    }[],
    type: OperationType
  ): void {
    const chartContainer = document.getElementById(
      'category-chart'
    )!;

    if (this.categoryChart) {
      this.categoryChart.destroy();
      this.categoryChart = null;
    }

    if (items.length === 0) {
      chartContainer.classList.add('d-none');
      return;
    }

    if (typeof Highcharts === 'undefined') {
      chartContainer.classList.add('d-none');
      console.warn('Highcharts is not available.');
      return;
    }

    chartContainer.classList.remove('d-none');

    this.categoryChart = Highcharts.chart('category-chart', {
      chart: {
        type: 'pie'
      },

      title: {
        text:
          type === 'Expense'
            ? 'Expense Distribution by Category'
            : 'Revenue Distribution by Category'
      },

      tooltip: {
        pointFormat:
          '<b>{point.percentage:.1f}%</b><br/>Amount: {point.y:.2f}'
      },

      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },

      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',

          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.1f}%'
          }
        }
      },

      series: [
        {
          name: 'Amount',
          colorByPoint: true,

          data: items.map((item) => ({
            name: item.categoryName,
            y: item.totalAmount
          }))
        }
      ]
    });
  }

  // --- Export ---

  private bindExportEvents(): void {
    const csvButton = document.getElementById(
      'btn-export-csv'
    )!;

    const jsonButton = document.getElementById(
      'btn-export-json'
    )!;

    csvButton.addEventListener('click', () => {
      ExportService.exportCSV(
        this.categoryRepo.getAll(),
        this.activityRepo.getAll()
      );
    });

    jsonButton.addEventListener('click', () => {
      ExportService.exportJSON(
        this.categoryRepo.getAll(),
        this.activityRepo.getAll()
      );
    });
  }
}

// Start the application after the HTML document has been parsed.
new AppController();
