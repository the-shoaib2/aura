import { iconSetAlpine, themeQuartz } from 'ag-grid-community';

export const auraTheme = themeQuartz.withPart(iconSetAlpine).withParams({
	columnBorder: true,
	rowBorder: true,
	rowVerticalPaddingScale: 0.8,
	sidePanelBorder: true,
	wrapperBorder: true,
	headerColumnBorder: { color: 'var(--color--foreground)' },
	headerColumnBorderHeight: '100%',
	checkboxUncheckedBackgroundColor: 'var(--color--background--light-1)',
	checkboxCheckedBackgroundColor: 'var(--color--primary)',
});
