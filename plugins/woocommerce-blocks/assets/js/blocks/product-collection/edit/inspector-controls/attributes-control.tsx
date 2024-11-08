/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import ProductAttributeTermControl from '@woocommerce/editor-components/product-attribute-term-control';
import { SearchListItem } from '@woocommerce/editor-components/search-list-control/types';
import { ADMIN_URL } from '@woocommerce/settings';
import {
	ExternalLink,
	// @ts-expect-error Using experimental features
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { CoreFilterNames, QueryControlProps } from '../../types';
import { DEFAULT_FILTERS } from '../../constants';

const EDIT_ATTRIBUTES_URL = `${ ADMIN_URL }edit.php?post_type=product&page=product_attributes`;

const AttributesControl = ( {
	query,
	trackInteraction,
	setQueryAttribute,
}: QueryControlProps ) => {
	const woocommerceAttributes = query.woocommerceAttributes || [];
	const selectedAttributes = woocommerceAttributes?.map(
		( { termId: id } ) => ( {
			id,
		} )
	);

	const deselectCallback = () => {
		setQueryAttribute( {
			woocommerceAttributes: DEFAULT_FILTERS.woocommerceAttributes,
		} );
		trackInteraction( CoreFilterNames.ATTRIBUTES );
	};

	return (
		<ToolsPanelItem
			label={ __( 'Product Attributes', 'woocommerce' ) }
			hasValue={ () => !! woocommerceAttributes?.length }
			onDeselect={ deselectCallback }
			resetAllFilter={ deselectCallback }
		>
			<ProductAttributeTermControl
				messages={ {
					search: __( 'Attributes', 'woocommerce' ),
				} }
				selected={ selectedAttributes || [] }
				onChange={ ( searchListItems: SearchListItem[] ) => {
					const newValue = searchListItems.map(
						( { id, value } ) => ( {
							termId: id as number,
							taxonomy: value as string,
						} )
					);

					setQueryAttribute( {
						woocommerceAttributes: newValue,
					} );
					trackInteraction( CoreFilterNames.ATTRIBUTES );
				} }
				operator={ 'any' }
				isCompact={ true }
				type={ 'token' }
			/>
			<ExternalLink
				className="wc-block-editor-product-collection-panel__manage-attributes-link"
				href={ EDIT_ATTRIBUTES_URL }
			>
				{ __( 'Manage attributes', 'woocommerce' ) }
			</ExternalLink>
		</ToolsPanelItem>
	);
};

export default AttributesControl;
