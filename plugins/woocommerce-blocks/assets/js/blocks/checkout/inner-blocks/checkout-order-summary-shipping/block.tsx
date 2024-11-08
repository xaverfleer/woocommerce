/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { TotalsShipping } from '@woocommerce/base-components/cart-checkout';
import { useStoreCart } from '@woocommerce/base-context';
import { TotalsWrapper } from '@woocommerce/blocks-checkout';
import { useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@woocommerce/block-data';
import {
	filterShippingRatesByPrefersCollection,
	isAddressComplete,
	selectedRatesAreCollectable,
} from '@woocommerce/base-utils';

const Block = ( {
	className = '',
}: {
	className?: string;
} ): JSX.Element | null => {
	const { cartNeedsShipping, shippingRates, shippingAddress } =
		useStoreCart();
	const prefersCollection = useSelect( ( select ) =>
		select( CHECKOUT_STORE_KEY ).prefersCollection()
	);

	if ( ! cartNeedsShipping ) {
		return null;
	}

	const hasSelectedCollectionOnly = selectedRatesAreCollectable(
		filterShippingRatesByPrefersCollection(
			shippingRates,
			prefersCollection ?? false
		)
	);

	const hasCompleteAddress = isAddressComplete( shippingAddress, [
		'state',
		'country',
		'postcode',
		'city',
	] );

	return (
		<TotalsWrapper className={ className }>
			<TotalsShipping
				label={
					hasSelectedCollectionOnly
						? __( 'Collection', 'woocommerce' )
						: __( 'Delivery', 'woocommerce' )
				}
				placeholder={
					<span className="wc-block-components-shipping-placeholder__value">
						{ hasCompleteAddress
							? __(
									'No available delivery option',
									'woocommerce'
							  )
							: __(
									'Enter address to calculate',
									'woocommerce'
							  ) }
					</span>
				}
			/>
		</TotalsWrapper>
	);
};

export default Block;
