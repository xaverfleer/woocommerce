/**
 * External dependencies
 */
import { expect, test } from '@woocommerce/e2e-utils';

const blockData = {
	name: 'Catalog Sorting',
	slug: 'woocommerce/catalog-sorting',
	class: '.wc-block-catalog-sorting',
};

test.describe( `${ blockData.slug } Block`, () => {
	test( "block can't be inserted in Post Editor", async ( {
		editor,
		admin,
	} ) => {
		await admin.createNewPost();
		await expect(
			editor.insertBlock( { name: blockData.slug } )
		).rejects.toThrow(
			new RegExp( `Block type '${ blockData.slug }' is not registered.` )
		);
	} );

	test( 'block can be inserted in the Site Editor', async ( {
		admin,
		requestUtils,
		editor,
	} ) => {
		const template = await requestUtils.createTemplate( 'wp_template', {
			slug: 'sorter',
			title: 'Sorter',
			content: 'howdy',
		} );

		await admin.visitSiteEditor( {
			postId: template.id,
			postType: 'wp_template',
			canvas: 'edit',
		} );

		await expect( editor.canvas.getByText( 'howdy' ) ).toBeVisible();

		await editor.insertBlock( {
			name: blockData.slug,
		} );

		const block = await editor.getBlockByName( blockData.slug );
		await expect( block ).toHaveText( 'Default sorting' );
	} );
} );
