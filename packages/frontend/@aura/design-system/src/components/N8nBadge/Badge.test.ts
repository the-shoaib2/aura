import { render } from '@testing-library/vue';

import N8nBadge from './Badge.vue';

describe('components', () => {
	describe('N8nBadge', () => {
		describe('props', () => {
			it('should render default theme correctly', () => {
				const wrapper = render(N8nBadge, {
					props: {
						theme: 'default',
						size: 'large',
						bold: true,
					},
					slots: {
						default: '<aura-text>Default badge</aura-text>',
					},
					global: {
						stubs: ['N8nText'],
					},
				});
				expect(wrapper.html()).toMatchSnapshot();
			});
			it('should render secondary theme correctly', () => {
				const wrapper = render(N8nBadge, {
					props: {
						theme: 'secondary',
						size: 'medium',
						bold: false,
					},
					slots: {
						default: '<aura-text>Secondary badge</aura-text>',
					},
					global: {
						stubs: ['N8nText'],
					},
				});
				expect(wrapper.html()).toMatchSnapshot();
			});
			it('should render with default values correctly', () => {
				const wrapper = render(N8nBadge, {
					slots: {
						default: '<aura-text>A Badge</aura-text>',
					},
					global: {
						stubs: ['N8nText'],
					},
				});
				expect(wrapper.html()).toMatchSnapshot();
			});
		});
	});
});
