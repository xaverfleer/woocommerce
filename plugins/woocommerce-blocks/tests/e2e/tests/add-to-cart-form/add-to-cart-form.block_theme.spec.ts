/**
 * External dependencies
 */
import { Page } from '@playwright/test';
import { test as base, expect, Editor, wpCLI } from '@woocommerce/e2e-utils';

/**
 * Internal dependencies
 */

const blockData = {
	name: 'Add to Cart with Options',
	slug: 'woocommerce/add-to-cart-form',
	mainClass: '.wc-block-add-to-cart-form',
	selectors: {
		editor: {
			stepperMinusButton:
				'.wc-block-components-quantity-selector__button--minus',
			stepperPlusButton:
				'.wc-block-components-quantity-selector__button--plus',
		},
	},
};

class BlockUtils {
	editor: Editor;
	page: Page;

	constructor( { editor, page }: { editor: Editor; page: Page } ) {
		this.editor = editor;
		this.page = page;
	}

	/**
	 * Configures the Single Product Block in the editor.
	 * If a product name is provided, it searches for the product by name and selects it.
	 * If no product name is provided, it selects the first product in the list by default.
	 */
	async configureSingleProductBlock( name?: string ) {
		const singleProductBlock = await this.editor.getBlockByName(
			'woocommerce/single-product'
		);

		if ( name ) {
			await singleProductBlock
				.locator( 'input[type="search"]' )
				.fill( name );
			await singleProductBlock.getByText( 'Search' ).click();
			await singleProductBlock.getByText( name ).click();
		} else {
			await singleProductBlock
				.locator( 'input[type="radio"]' )
				.nth( 0 )
				.click();
		}

		await singleProductBlock.getByText( 'Done' ).click();
	}

	async enableStepperMode() {
		await ( await this.editor.getBlockByName( blockData.slug ) ).click();
		await this.page.getByLabel( 'Stepper' ).click();
	}

	async createSoldIndividuallyProduct() {
		await wpCLI(
			'wc product create --name="Sold Individually" --regular_price=10 --sold_individually=true --user=admin'
		);
	}

	/**
	 * Sets the min, max, and step attributes for the input field.
	 * This is useful for simulating extensions that set these attributes via woocommerce_quantity_input
	 * https://github.com/woocommerce/woocommerce/blob/89945ca8fc4589c061ba2130bf72bf24dc9268bd/plugins/woocommerce/includes/wc-template-functions.php#L1877-L1878
	 *
	 */
	async setMinMaxAndStep( {
		min,
		max,
		step,
	}: {
		min: number;
		max: number;
		step: number;
	} ) {
		const input = this.page.locator( "input[type='number']" );
		await input.evaluate(
			( el: HTMLInputElement, data ) => {
				el.setAttribute( 'min', data.min.toString() );
				el.setAttribute( 'max', data.max.toString() );
				el.setAttribute( 'step', data.step.toString() );
				el.value = data.min.toString();
			},
			{ min, max, step }
		);
	}
}

const test = base.extend< { blockUtils: BlockUtils } >( {
	blockUtils: async ( { editor, page }, use ) => {
		await use( new BlockUtils( { editor, page } ) );
	},
} );

test.describe( `${ blockData.name } Block`, () => {
	test( 'can be added in the Post Editor only as inner block of the Single Product Block', async ( {
		admin,
		editor,
		blockUtils,
	} ) => {
		// Add to Cart with Options in the Post Editor is only available as inner block of the Single Product Block.
		await admin.createNewPost();
		await editor.insertBlock( { name: 'woocommerce/single-product' } );

		await blockUtils.configureSingleProductBlock();

		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeVisible();

		// When the block is registered as ancestor, the function doesn't throw an error, but the block is not added.
		// So we check that only one instance of the block is present.
		await editor.insertBlock( { name: blockData.slug } );
		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeVisible();
	} );

	test( 'can be added in the Site Editor only as inner block of the Single Product Block - Product Catalog Template', async ( {
		admin,
		editor,
		requestUtils,
		blockUtils,
	} ) => {
		// Add to Cart with Options in the Site Editor is only available as
		// inner block of the Single Product Block except for the Single Product
		// Template
		const template = await requestUtils.createTemplate( 'wp_template', {
			slug: 'product-catalog',
			title: 'Custom Product Catalog',
			content: 'placeholder',
		} );

		await admin.visitSiteEditor( {
			postId: template.id,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await expect( editor.canvas.getByText( 'placeholder' ) ).toBeVisible();

		await editor.insertBlock( { name: 'woocommerce/single-product' } );

		await blockUtils.configureSingleProductBlock();

		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeVisible();

		// When the block is registered as ancestor, the function doesn't throw an error, but the block is not added.
		// So we check that only one instance of the block is present.
		await editor.insertBlock( { name: blockData.slug } );
		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeVisible();
	} );

	test( 'can be added in the Post Editor - Single Product Template', async ( {
		admin,
		editor,
		requestUtils,
	} ) => {
		const template = await requestUtils.createTemplate( 'wp_template', {
			slug: 'single-product',
			title: 'Custom Single Product',
			content: 'placeholder',
		} );

		await admin.visitSiteEditor( {
			postId: template.id,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await expect( editor.canvas.getByText( 'placeholder' ) ).toBeVisible();

		await editor.insertBlock( { name: blockData.slug } );

		await expect(
			await editor.getBlockByName( blockData.slug )
		).toBeVisible();
	} );

	test.describe( 'Stepper Layout', () => {
		test.beforeEach( async ( { requestUtils } ) => {
			await requestUtils.setFeatureFlag(
				'add-to-cart-with-options-stepper-layout',
				true
			);
		} );
		test( 'has the stepper option visible', async ( {
			admin,
			editor,
			blockUtils,
		} ) => {
			await admin.createNewPost();
			await editor.insertBlock( { name: 'woocommerce/single-product' } );

			await blockUtils.configureSingleProductBlock();

			await blockUtils.enableStepperMode();

			const minusButton = editor.canvas.locator(
				blockData.selectors.editor.stepperMinusButton
			);
			const plusButton = editor.canvas.locator(
				blockData.selectors.editor.stepperPlusButton
			);

			await expect( minusButton ).toBeVisible();
			await expect( plusButton ).toBeVisible();
		} );

		test( 'has the stepper mode working on the frontend', async ( {
			admin,
			editor,
			blockUtils,
			page,
		} ) => {
			await admin.createNewPost();
			await editor.insertBlock( { name: 'woocommerce/single-product' } );

			const productName = 'Hoodie with Logo';

			await blockUtils.configureSingleProductBlock( productName );

			await blockUtils.enableStepperMode();

			await editor.publishAndVisitPost();

			const minusButton = page.getByLabel( `Reduce quantity` );
			const plusButton = page.getByLabel( `Increase quantity` );

			await expect( minusButton ).toBeVisible();
			await expect( plusButton ).toBeVisible();

			const input = page.getByLabel( 'Product quantity' );

			await expect( input ).toHaveValue( '1' );
			await plusButton.click();
			await expect( input ).toHaveValue( '2' );
			await minusButton.click();
			await expect( input ).toHaveValue( '1' );
			// Ensure the quantity doesn't go below 1.
			await minusButton.click();
			await expect( input ).toHaveValue( '1' );
		} );

		test( "doesn't render stepper when the product is sold individually", async ( {
			admin,
			editor,
			blockUtils,
			page,
		} ) => {
			await blockUtils.createSoldIndividuallyProduct();
			await admin.createNewPost();
			await editor.insertBlock( { name: 'woocommerce/single-product' } );

			const productName = 'Sold Individually';

			await blockUtils.configureSingleProductBlock( productName );
			await blockUtils.enableStepperMode();

			await editor.publishAndVisitPost();

			const minusButton = page.getByLabel( `Reduce quantity` );
			const plusButton = page.getByLabel( `Increase quantity ` );

			await expect( minusButton ).toBeHidden();
			await expect( plusButton ).toBeHidden();
		} );

		test( 'has the stepper mode working on the frontend with min, max, and step attributes', async ( {
			admin,
			editor,
			blockUtils,
			page,
		} ) => {
			await admin.createNewPost();
			await editor.insertBlock( { name: 'woocommerce/single-product' } );

			const productName = 'Hoodie with Logo';

			await blockUtils.configureSingleProductBlock( productName );

			await blockUtils.enableStepperMode();
			await editor.publishAndVisitPost();

			await blockUtils.setMinMaxAndStep( {
				min: 2,
				max: 10,
				step: 2,
			} );

			const minusButton = page.getByLabel( `Reduce quantity` );
			const plusButton = page.getByLabel( `Increase quantity` );

			await expect( minusButton ).toBeVisible();
			await expect( plusButton ).toBeVisible();

			const input = page.getByLabel( 'Product quantity' );

			await expect( input ).toHaveValue( '2' );
			await minusButton.click();
			await expect( input ).toHaveValue( '2' );
			await plusButton.click();
			await expect( input ).toHaveValue( '4' );
			await plusButton.click();
			await expect( input ).toHaveValue( '6' );
			await plusButton.click();
			await expect( input ).toHaveValue( '8' );
			await plusButton.click();
			await expect( input ).toHaveValue( '10' );
			await plusButton.click();
			await expect( input ).toHaveValue( '10' );
		} );
	} );
} );
