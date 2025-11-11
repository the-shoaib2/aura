import type { auraPage } from '../pages/auraPage';

export class DataTableComposer {
	constructor(private readonly aura: auraPage) {}

	async createNewDataTable(name: string) {
		const nameInput = this.aura.dataTable.getNewDataTableNameInput();
		await nameInput.fill(name);
		await this.aura.dataTable.getNewDataTableConfirmButton().click();
	}

	/**
	 * Creates project and data table inside it, navigating to project 'Data Table' tab
	 * @param projectName
	 * @param dataTableName
	 * @param source - from where the creation is initiated (empty state or header dropdown)
	 */
	async createDataTableInNewProject(
		projectName: string,
		dataTableName: string,
		source: 'empty-state' | 'header-dropdown',
		fromDataTableTab: boolean = true,
	) {
		await this.aura.projectComposer.createProject(projectName);
		const { projectId } = await this.aura.projectComposer.createProject();

		if (fromDataTableTab) {
			await this.aura.page.goto(`projects/${projectId}/datatables`);
		} else {
			await this.aura.page.goto(`projects/${projectId}`);
		}

		if (source === 'empty-state') {
			await this.aura.dataTable.clickEmptyStateButton();
		} else {
			await this.aura.dataTable.clickAddDataTableAction(fromDataTableTab);
		}
		await this.aura.dataTableComposer.createNewDataTable(dataTableName);
		await this.aura.page.goto(`projects/${projectId}/datatables`);
	}
}
