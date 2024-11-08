/**
 * External dependencies
 */
import { TemplateCompiler, test as base, expect } from '@woocommerce/e2e-utils';

const test = base.extend< { templateCompiler: TemplateCompiler } >( {
	templateCompiler: async ( { requestUtils }, use ) => {
		const compiler = await requestUtils.createTemplateFromFile(
			'archive-product_active-filters'
		);
		await use( compiler );
	},
} );

test.describe( 'woocommerce/product-filter-active - Frontend', () => {
	test.beforeEach( async ( { requestUtils } ) => {
		await requestUtils.setFeatureFlag( 'experimental-blocks', true );
	} );

	test( 'Without any filters selected, active block should not be rendered', async ( {
		page,
		templateCompiler,
	} ) => {
		await templateCompiler.compile( {} );

		await page.goto( '/shop' );

		const chips = page.locator(
			'.wp-block-woocommerce-product-filter-active'
		);

		await expect( chips ).toHaveCount( 1 );
	} );

	test( 'With rating filters applied it shows the correct active filters', async ( {
		page,
		templateCompiler,
	} ) => {
		await templateCompiler.compile( {} );

		await page.goto( `${ '/shop' }?rating_filter=1,2,5` );

		await expect(
			page.getByText( 'Rating: Rated 1 out of 5' )
		).toBeVisible();
		await expect(
			page.getByText( 'Rating: Rated 2 out of 5' )
		).toBeVisible();
		await expect(
			page.getByText( 'Rating: Rated 5 out of 5' )
		).toBeVisible();
	} );

	test( 'With stock filters applied it shows the correct active filters', async ( {
		page,
		templateCompiler,
	} ) => {
		await templateCompiler.compile( {} );

		await page.goto(
			`${ '/shop' }?filter_stock_status=instock,onbackorder`
		);

		await expect( page.getByText( 'Status: In stock' ) ).toBeVisible();
		await expect( page.getByText( 'Status: On backorder' ) ).toBeVisible();
	} );

	test( 'With attribute filters applied it shows the correct active filters', async ( {
		page,
		templateCompiler,
	} ) => {
		await templateCompiler.compile( {} );

		await page.goto(
			`${ '/shop' }?filter_color=blue,gray&query_type_color=or`
		);

		await expect( page.getByText( 'Color: Blue' ) ).toBeVisible();
		await expect( page.getByText( 'Color: Gray' ) ).toBeVisible();
	} );

	test( 'With price filters applied it shows the correct active filters', async ( {
		page,
		templateCompiler,
	} ) => {
		await templateCompiler.compile( {} );

		await page.goto( `${ '/shop' }?min_price=17&max_price=71` );

		await expect(
			page.getByText( 'Price: Between $17 and $71' )
		).toBeVisible();
	} );
} );
