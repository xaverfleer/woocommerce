/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { isWpVersion } from '@woocommerce/settings';
import { VARIATION_NAME as PRODUCT_TITLE_VARIATION_NAME } from '@woocommerce/blocks/product-query/variations/elements/product-title';
import { VARIATION_NAME as PRODUCT_SUMMARY_VARIATION_NAME } from '@woocommerce/blocks/product-query/variations/elements/product-summary';
import {
	INNER_BLOCKS_PRODUCT_TEMPLATE as productCollectionInnerBlocksTemplate,
	DEFAULT_ATTRIBUTES as productCollectionDefaultAttributes,
	DEFAULT_QUERY as productCollectionDefaultQuery,
} from '@woocommerce/blocks/product-collection/constants';
import {
	BlockInstance,
	createBlock,
	// @ts-expect-error Type definitions for this function are missing in Gutenberg
	createBlocksFromInnerBlocksTemplate,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { OnClickCallbackParameter } from './types';

const getBlockifiedTemplate = () =>
	[
		createBlock( 'woocommerce/breadcrumbs' ),
		createBlock( 'woocommerce/store-notices' ),
		createBlock(
			'core/columns',
			{
				align: 'wide',
			},
			[
				createBlock(
					'core/column',
					{
						type: 'constrained',
						justifyContent: 'right',
						width: '512px',
					},
					[ createBlock( 'woocommerce/product-image-gallery' ) ]
				),
				createBlock( 'core/column', {}, [
					createBlock( 'core/post-title', {
						__woocommerceNamespace: PRODUCT_TITLE_VARIATION_NAME,
						level: 1,
					} ),
					createBlock( 'woocommerce/product-rating' ),
					createBlock( 'woocommerce/product-price', {
						fontSize: 'large',
					} ),
					createBlock( 'core/post-excerpt', {
						__woocommerceNamespace: PRODUCT_SUMMARY_VARIATION_NAME,
						excerptLength: 100,
					} ),
					createBlock( 'woocommerce/add-to-cart-form' ),
					createBlock( 'woocommerce/product-meta' ),
				] ),
			]
		),
		createBlock( 'woocommerce/product-details', {
			align: 'wide',
			className: 'is-style-minimal',
		} ),
		createBlock( 'core/heading', {
			align: 'wide',
			level: 2,
			content: __( 'Related Products', 'woocommerce' ),
			style: { spacing: { margin: { bottom: '1rem' } } },
		} ),
		createBlock(
			'woocommerce/product-collection',
			{
				...productCollectionDefaultAttributes,
				query: {
					...productCollectionDefaultQuery,
					perPage: 5,
					pages: 1,
					woocommerceStockStatus: [ 'instock', 'onbackorder' ],
					filterable: false,
				},
				displayLayout: {
					type: 'flex',
					columns: 5,
					shrinkColumns: true,
				},
				collection: 'woocommerce/product-collection/related',
				hideControls: [ 'inherit' ],
				align: 'wide',
			},
			createBlocksFromInnerBlocksTemplate( [
				productCollectionInnerBlocksTemplate,
			] )
		),
	].filter( Boolean ) as BlockInstance[];

const isConversionPossible = () => {
	// Blockification is possible for the WP version 6.1 and above,
	// which are the versions the Products block supports.
	return isWpVersion( '6.1', '>=' );
};

const getDescriptionAllowingConversion = ( templateTitle: string ) =>
	sprintf(
		/* translators: %s is the template title */
		__(
			'Transform this template into multiple blocks so you can add, remove, reorder, and customize your %s template.',
			'woocommerce'
		),
		templateTitle
	);

const getDescriptionDisallowingConversion = ( templateTitle: string ) =>
	sprintf(
		/* translators: %s is the template title */
		__(
			'This block serves as a placeholder for your %s. It will display the actual product image, title, price in your store. You can move this placeholder around and add more blocks around to customize the template.',
			'woocommerce'
		),
		templateTitle
	);

const getDescription = ( templateTitle: string, canConvert: boolean ) => {
	if ( canConvert ) {
		return getDescriptionAllowingConversion( templateTitle );
	}

	return getDescriptionDisallowingConversion( templateTitle );
};

const getButtonLabel = () => __( 'Transform into blocks', 'woocommerce' );

const onClickCallback = ( {
	clientId,
	getBlocks,
	replaceBlock,
	selectBlock,
}: OnClickCallbackParameter ) => {
	replaceBlock( clientId, getBlockifiedTemplate() );

	const blocks = getBlocks();
	const groupBlock = blocks.find(
		( block ) =>
			block.name === 'core/group' &&
			block.innerBlocks.some(
				( innerBlock ) => innerBlock.name === 'woocommerce/breadcrumbs'
			)
	);

	if ( groupBlock ) {
		selectBlock( groupBlock.clientId );
	}
};

const blockifyConfig = {
	getButtonLabel,
	onClickCallback,
	getBlockifiedTemplate,
};

export { isConversionPossible, getDescription, blockifyConfig };
