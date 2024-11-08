/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockContextProvider,
} from '@wordpress/block-editor';
import Rating from '@woocommerce/base-components/product-rating';
import {
	useQueryStateByKey,
	useQueryStateByContext,
	useCollectionData,
} from '@woocommerce/base-context/hooks';
import { getSettingWithCoercion } from '@woocommerce/settings';
import { isBoolean } from '@woocommerce/types';
import { useState, useMemo, useEffect } from '@wordpress/element';
import { withSpokenMessages } from '@wordpress/components';
import type { BlockEditProps } from '@wordpress/blocks';
import type { WCStoreV1ProductsCollectionProps } from '@woocommerce/blocks/product-collection/types';

/**
 * Internal dependencies
 */
import { previewOptions } from './preview';
import { getActiveFilters } from './utils';
import { Inspector } from './components/inspector';
import { getAllowedBlocks } from '../../utils';
import { EXCLUDED_BLOCKS } from '../../constants';
import { Notice } from '../../components/notice';
import type { Attributes } from './types';
import './style.scss';
import { InitialDisabled } from '../../components/initial-disabled';
import { useProductFilterClearButtonManager } from '../../hooks/use-product-filter-clear-button-manager';

const RatingFilterEdit = ( props: BlockEditProps< Attributes > ) => {
	const { attributes, setAttributes } = props;

	const { isPreview, showCounts, minRating } = attributes;

	const { children, ...innerBlocksProps } = useInnerBlocksProps(
		useBlockProps(),
		{
			allowedBlocks: getAllowedBlocks( EXCLUDED_BLOCKS ),
			template: [
				[
					'core/group',
					{
						layout: {
							type: 'flex',
							flexWrap: 'nowrap',
						},
						metadata: {
							name: __( 'Header', 'woocommerce' ),
						},
						style: {
							spacing: {
								blockGap: '0',
							},
						},
					},
					[
						[
							'core/heading',
							{
								level: 3,
								content: __( 'Rating', 'woocommerce' ),
							},
						],
						[
							'woocommerce/product-filter-clear-button',
							{
								lock: {
									remove: true,
									move: false,
								},
							},
						],
					],
				],
				[
					'woocommerce/product-filter-checkbox-list',
					{
						lock: {
							remove: true,
						},
					},
				],
			],
		}
	);

	const [ queryState ] = useQueryStateByContext();

	const { results: collectionFilters, isLoading: filteredCountsLoading } =
		useCollectionData< WCStoreV1ProductsCollectionProps >( {
			queryRating: true,
			queryState,
			isEditor: true,
		} );

	const [ displayedOptions, setDisplayedOptions ] = useState(
		isPreview ? previewOptions : []
	);

	const isLoading =
		! isPreview && filteredCountsLoading && displayedOptions.length === 0;

	const initialFilters = useMemo(
		() => getActiveFilters( 'rating_filter' ),
		[]
	);

	const [ productRatingsQuery ] = useQueryStateByKey(
		'rating',
		initialFilters
	);

	/**
	 * Compare intersection of all ratings
	 * and filtered counts to get a list of options to display.
	 */
	useEffect( () => {
		if ( filteredCountsLoading || isPreview ) {
			return;
		}

		if ( collectionFilters?.rating_counts?.length === 0 ) {
			setDisplayedOptions( previewOptions );
			return;
		}

		const minimumRating =
			typeof minRating === 'string' ? parseFloat( minRating ) : 0;

		/*
		 * Process the ratings counts:
		 * - Sort the ratings in descending order
		 *   Todo: consider to handle this in the API request
		 * - Filter out ratings below the minimum rating
		 * - Map the ratings to the format expected by the filter component
		 */
		const productsRating = collectionFilters.rating_counts
			.sort( ( a, b ) => b.rating - a.rating )
			.filter( ( { rating } ) => rating >= minimumRating )
			.map( ( { rating, count } ) => ( {
				label: (
					<Rating
						key={ rating }
						rating={ rating }
						ratedProductsCount={ showCounts ? count : null }
					/>
				),
				value: rating?.toString(),
			} ) );

		setDisplayedOptions( productsRating );
	}, [
		showCounts,
		isPreview,
		collectionFilters,
		filteredCountsLoading,
		productRatingsQuery,
		minRating,
	] );

	useProductFilterClearButtonManager( {
		clientId: props.clientId,
		showClearButton: attributes.clearButton,
	} );

	if ( ! filteredCountsLoading && displayedOptions.length === 0 ) {
		return null;
	}

	const hasFilterableProducts = getSettingWithCoercion(
		'hasFilterableProducts',
		false,
		isBoolean
	);

	if ( ! hasFilterableProducts ) {
		return null;
	}

	const showNoProductsNotice =
		! filteredCountsLoading && ! collectionFilters.rating_counts?.length;

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...innerBlocksProps }>
				<InitialDisabled>
					{ showNoProductsNotice && (
						<Notice>
							{ __(
								"Your store doesn't have any products with ratings yet. This filter option will display when a product receives a review.",
								'woocommerce'
							) }
						</Notice>
					) }
					<div
						className={ clsx( {
							'is-loading': isLoading,
						} ) }
					>
						<BlockContextProvider
							value={ {
								filterData: {
									items: displayedOptions,
									isLoading,
								},
							} }
						>
							{ children }
						</BlockContextProvider>
					</div>
				</InitialDisabled>
			</div>
		</>
	);
};

export default withSpokenMessages( RatingFilterEdit );
