/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	Flex,
	FlexItem,
	PanelBody,
	RadioControl,
	ToggleControl,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import RatingStars from './rating-stars';
import type { Attributes } from '../types';

function MinimumRatingLabel( {
	stars,
	ariaLabel,
}: {
	stars: number;
	ariaLabel: string;
} ) {
	return (
		<Flex
			title={ ariaLabel }
			aria-label={ ariaLabel }
			justify="flex-start"
			gap={ 1 }
		>
			<FlexItem>
				<RatingStars stars={ stars } />
			</FlexItem>
			<FlexItem>{ __( '& up', 'woocommerce' ) }</FlexItem>
		</Flex>
	);
}

export const Inspector = ( {
	attributes,
	setAttributes,
}: Pick< BlockEditProps< Attributes >, 'attributes' | 'setAttributes' > ) => {
	const { showCounts, minRating, clearButton } = attributes;

	function setCountVisibility( value: boolean ) {
		setAttributes( {
			showCounts: value,
		} );
	}

	function setMinRating( value: string ) {
		setAttributes( {
			minRating: value,
		} );
	}

	return (
		<>
			<InspectorControls key="inspector">
				<PanelBody title={ __( 'Display', 'woocommerce' ) }>
					<ToggleControl
						label={ __( 'Display product count', 'woocommerce' ) }
						checked={ showCounts }
						onChange={ setCountVisibility }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Minimum rating', 'woocommerce' ) }>
					<RadioControl
						selected={ minRating }
						className="wc-block-rating-filter__rating-control"
						options={ [
							{
								label: (
									<MinimumRatingLabel
										stars={ 4 }
										ariaLabel={ __(
											'Four stars and up',
											'woocommerce'
										) }
									/>
								),
								value: '4',
							},
							{
								label: (
									<MinimumRatingLabel
										stars={ 3 }
										ariaLabel={ __(
											'Three stars and up',
											'woocommerce'
										) }
									/>
								),
								value: '3',
							},
							{
								label: (
									<MinimumRatingLabel
										stars={ 2 }
										ariaLabel={ __(
											'Two stars and up',
											'woocommerce'
										) }
									/>
								),
								value: '2',
							},
							{
								label: __( 'No limit', 'woocommerce' ),
								value: '0', // no limit
							},
						] }
						onChange={ setMinRating }
					/>
				</PanelBody>
			</InspectorControls>

			<InspectorControls group="styles">
				<PanelBody title={ __( 'Display', 'woocommerce' ) }>
					<ToggleControl
						label={ __( 'Clear button', 'woocommerce' ) }
						checked={ clearButton }
						onChange={ ( value ) =>
							setAttributes( { clearButton: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
};
