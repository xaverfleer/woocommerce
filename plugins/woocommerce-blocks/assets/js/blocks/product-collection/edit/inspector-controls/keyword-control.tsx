/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';
import {
	TextControl,
	// @ts-expect-error Using experimental features
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { CoreFilterNames, QueryControlProps } from '../../types';

const KeywordControl = ( props: QueryControlProps ) => {
	const { query, trackInteraction, setQueryAttribute } = props;
	const [ querySearch, setQuerySearch ] = useState( query.search );

	const onChangeDebounced = useDebounce( () => {
		if ( query.search !== querySearch ) {
			setQueryAttribute( {
				search: querySearch,
			} );
			trackInteraction( CoreFilterNames.KEYWORD );
		}
	}, 250 );

	useEffect( () => {
		onChangeDebounced();
		return onChangeDebounced.cancel;
	}, [ querySearch, onChangeDebounced ] );

	const deselectCallback = () => {
		setQuerySearch( '' );
		trackInteraction( CoreFilterNames.KEYWORD );
	};

	return (
		<ToolsPanelItem
			hasValue={ () => !! querySearch }
			label={ __( 'Keyword', 'woocommerce' ) }
			onDeselect={ deselectCallback }
			resetAllFilter={ deselectCallback }
		>
			<TextControl
				label={ __( 'Keyword', 'woocommerce' ) }
				value={ querySearch }
				onChange={ setQuerySearch }
			/>
		</ToolsPanelItem>
	);
};

export default KeywordControl;
