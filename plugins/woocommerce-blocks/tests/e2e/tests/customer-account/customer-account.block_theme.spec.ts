/**
 * External dependencies
 */
import { expect, test } from '@woocommerce/e2e-utils';

const blockData = {
	name: 'woocommerce/customer-account',
	selectors: {
		frontend: {
			icon: 'svg',
			label: '.label',
		},
		editor: {
			iconOptions: '.customer-account-display-style select',
			iconToggle: '.wc-block-customer-account__icon-style-toggle',
		},
	},
};

const selectTextOnlyOption = async ( { page } ) => {
	await page
		.locator( blockData.selectors.editor.iconOptions )
		.selectOption( 'Text-only' );

	page.locator( blockData.selectors.editor.iconToggle );
};

const selectIconOnlyOption = async ( { page } ) => {
	await page
		.locator( blockData.selectors.editor.iconOptions )
		.selectOption( 'Icon-only' );

	page.locator( blockData.selectors.editor.iconToggle );
};

const selectIconAndTextOption = async ( { page } ) => {
	await page
		.locator( blockData.selectors.editor.iconOptions )
		.selectOption( 'Icon and text' );

	page.locator( blockData.selectors.editor.iconToggle );
};

test.describe( `${ blockData.name } Block`, () => {
	test( 'Icon Options can be set to Text-only', async ( {
		admin,
		editor,
		page,
		frontendUtils,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( { name: blockData.name } );

		await selectTextOnlyOption( { page } );

		await editor.publishAndVisitPost();

		// We have specified the parent block name as 'main' to ensure that the
		// block is found within the main content area of the page and not the hooked block in the header.
		const block = await frontendUtils.getBlockByName(
			blockData.name,
			'main'
		);

		await expect(
			block.locator( blockData.selectors.frontend.label )
		).toBeVisible();
		await expect(
			block.locator( blockData.selectors.frontend.icon )
		).toBeHidden();
	} );

	test( 'Icon Options can be set to Icon-only', async ( {
		admin,
		editor,
		page,
		frontendUtils,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( { name: blockData.name } );

		await selectIconOnlyOption( { page } );

		await editor.publishAndVisitPost();

		// We have specified the parent block name as 'main' to ensure that the
		// block is found within the main content area of the page and not the hooked block in the header.
		const block = await frontendUtils.getBlockByName(
			blockData.name,
			'main'
		);

		await expect(
			block.locator( blockData.selectors.frontend.label )
		).toBeHidden();
		await expect(
			block.locator( blockData.selectors.frontend.icon )
		).toBeVisible();
	} );

	test( 'Icon Options can be set to Icon and text', async ( {
		admin,
		editor,
		page,
		frontendUtils,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( { name: blockData.name } );

		await selectIconAndTextOption( { page } );

		await editor.publishAndVisitPost();

		// We have specified the parent block name as 'main' to ensure that the
		// block is found within the main content area of the page and not the hooked block in the header.
		const block = await frontendUtils.getBlockByName(
			blockData.name,
			'main'
		);

		await expect(
			block.locator( blockData.selectors.frontend.label )
		).toBeVisible();
		await expect(
			block.locator( blockData.selectors.frontend.icon )
		).toBeVisible();
	} );
} );
