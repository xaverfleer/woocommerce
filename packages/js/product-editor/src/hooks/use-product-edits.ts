/**
 * External dependencies
 */
import { useEntityId } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
/**
 * Internal dependencies
 */
import { Metadata } from '../types';

type EntityEdits = {
	[ key: string ]: unknown;
};

// Filter out the "content" and "blocks" properties of the edits since
// we do not use these properties within the product editor and they
// will always create false positives.
function filterProductEdits( edits: EntityEdits ) {
	delete edits.content;
	delete edits.blocks;
	return edits;
}

export function useProductEdits( productType = <string>'product' ) {
	const productId = useEntityId( 'postType', productType );

	const { edits } = useSelect(
		( select ) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const { getEntityRecordNonTransientEdits } = select( 'core' );

			const _edits = getEntityRecordNonTransientEdits(
				'postType',
				productType,
				productId
			) as EntityEdits;

			return {
				edits: filterProductEdits( _edits ),
			};
		},
		[ productId, productType ]
	);

	function hasEdit( fieldName: string ) {
		if ( fieldName.startsWith( 'meta_data.' ) ) {
			const metaKey = fieldName.replace( 'meta_data.', '' );
			return (
				edits.hasOwnProperty( 'meta_data' ) &&
				( edits.meta_data as Metadata< unknown >[] ).findIndex(
					( value ) => value.key === metaKey
				) !== -1
			);
		}
		return edits.hasOwnProperty( fieldName );
	}

	return {
		hasEdit,
		hasEdits: Object.keys( edits ).length > 0,
	};
}
