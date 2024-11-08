/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import * as hooks from '@woocommerce/base-context/hooks';
import userEvent from '@testing-library/user-event';

/**
 * Internal dependencies
 */
import AttributeFilterBlock from '../block';
import { BlockAttributes } from '../types';

jest.mock( '@woocommerce/base-context/hooks', () => ( {
	__esModule: true,
	...jest.requireActual( '@woocommerce/base-context/hooks' ),
} ) );

const setWindowUrl = ( { url }: { url: string } ) => {
	global.window = Object.create( window );
	Object.defineProperty( window, 'location', {
		value: {
			href: url,
		},
		writable: true,
	} );
};

const stubProductsAttributesTerms = () => [
	{
		id: 25,
		name: 'Large',
		slug: 'large',
		description: '',
		parent: 0,
		count: 1,
	},
	{
		id: 26,
		name: 'Medium',
		slug: 'medium',
		description: '',
		parent: 0,
		count: 1,
	},
	{
		id: 27,
		name: 'Small',
		slug: 'small',
		description: '',
		parent: 0,
		count: 1,
	},
];

const stubCollectionData = () => ( {
	price_range: null,
	attribute_counts: [
		{
			term: 25,
			count: 1,
		},
		{
			term: 26,
			count: 1,
		},
		{
			term: 27,
			count: 1,
		},
	],
	rating_counts: null,
	stock_status_counts: null,
} );

interface SetupParams {
	initialUrl: string;
}

const setup = ( params: SetupParams ) => {
	const setupParams: SetupParams = {
		initialUrl: params.initialUrl || 'https://woo.local',
	};
	const url =
		setupParams.initialUrl ||
		'http://woo.local/?filter_size=large&query_type_size=or';
	setWindowUrl( { url } );

	const attributes: BlockAttributes = {
		attributeId: 2,
		showCounts: true,
		queryType: 'or',
		heading: 'Size',
		headingLevel: 3,
		displayStyle: 'list',
		showFilterButton: true,
		selectType: 'single',
		isPreview: false,
	};
	jest.spyOn( hooks, 'useCollection' ).mockReturnValue( {
		results: stubProductsAttributesTerms(),
		isLoading: false,
	} );

	jest.spyOn( hooks, 'useCollectionData' ).mockReturnValue( {
		results: stubCollectionData(),
		isLoading: false,
	} );
	const utils = render( <AttributeFilterBlock attributes={ attributes } />, {
		legacyRoot: true,
	} );
	// We need to switch to React 17 rendering to allow these tests to keep passing, but as a result the React
	// rendering error will be shown.
	expect( console ).toHaveErroredWith(
		`Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot`
	);
	const applyButton = screen.getByRole( 'button', { name: /apply/i } );
	const smallAttributeCheckbox = screen.getByRole( 'checkbox', {
		name: /small/i,
	} );

	return {
		...utils,
		applyButton,
		smallAttributeCheckbox,
	};
};

interface SetupWithSelectedFilterAttributesParams {
	filterSize: 'large' | 'medium' | 'small';
}

const setupWithSelectedFilterAttributes = (
	params: SetupWithSelectedFilterAttributesParams
) => {
	const setupParams: SetupWithSelectedFilterAttributesParams = {
		filterSize: params?.filterSize || 'large',
	};
	const utils = setup( {
		initialUrl: `http://woo.local/?filter_size=${ setupParams.filterSize }&query_type_size=or`,
	} );

	return {
		...utils,
	};
};

const setupWithoutSelectedFilterAttributes = () => {
	const utils = setup( { initialUrl: 'http://woo.local/' } );

	return {
		...utils,
	};
};

describe( 'Filter by Attribute block', () => {
	describe( 'Given no filter attribute is selected when page loads', () => {
		test( 'should disable Apply button when page loads', () => {
			const { applyButton } = setupWithoutSelectedFilterAttributes();

			expect( applyButton ).toBeDisabled();
		} );

		test( 'should enable Apply button when filter attributes are changed', async () => {
			const { applyButton, smallAttributeCheckbox } =
				setupWithoutSelectedFilterAttributes();
			await userEvent.click( smallAttributeCheckbox );

			expect( applyButton ).not.toBeDisabled();
		} );
	} );

	describe( 'Given filter attribute is already selected when page loads', () => {
		test( 'should disable Apply button when page loads', () => {
			const { applyButton } = setupWithSelectedFilterAttributes();

			expect( applyButton ).toBeDisabled();
		} );

		test( 'should enable Apply button when filter attributes are changed', async () => {
			const { applyButton, smallAttributeCheckbox } =
				setupWithSelectedFilterAttributes();
			await userEvent.click( smallAttributeCheckbox );

			expect( applyButton ).not.toBeDisabled();
		} );

		test( 'should disable Apply button when deselecting the same previously selected attribute', async () => {
			const { applyButton, smallAttributeCheckbox } =
				setupWithSelectedFilterAttributes( { filterSize: 'small' } );
			await userEvent.click( smallAttributeCheckbox );
			expect( applyButton ).not.toBeDisabled();

			await userEvent.click( smallAttributeCheckbox );
			expect( applyButton ).toBeDisabled();
		} );
	} );
} );
