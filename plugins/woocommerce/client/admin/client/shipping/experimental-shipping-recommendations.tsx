/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

import {
	PLUGINS_STORE_NAME,
	settingsStore,
	onboardingStore,
} from '@woocommerce/data';

/**
 * Internal dependencies
 */
import { getCountryCode } from '~/dashboard/utils';
import WooCommerceServicesItem from './experimental-woocommerce-services-item';
import { ShippingRecommendationsList } from './shipping-recommendations';
import './shipping-recommendations.scss';
import { ShippingTour } from '../guided-tours/shipping-tour';

const ShippingRecommendations: React.FC = () => {
	const {
		activePlugins,
		installedPlugins,
		countryCode,
		isJetpackConnected,
		isSellingDigitalProductsOnly,
	} = useSelect( ( select ) => {
		const settings = select( settingsStore ).getSettings( 'general' );

		const {
			getActivePlugins,
			getInstalledPlugins,
			isJetpackConnected: _isJetpackConnected,
		} = select( PLUGINS_STORE_NAME );

		const profileItems =
			select( onboardingStore ).getProfileItems().product_types;

		return {
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
			activePlugins: getActivePlugins(),
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
			installedPlugins: getInstalledPlugins(),
			countryCode: getCountryCode(
				settings.general?.woocommerce_default_country
			),
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
			isJetpackConnected: _isJetpackConnected(),
			isSellingDigitalProductsOnly:
				profileItems?.length === 1 && profileItems[ 0 ] === 'downloads',
		};
	}, [] );

	if (
		activePlugins.includes( 'woocommerce-shipping' ) ||
		activePlugins.includes( 'woocommerce-tax' )
	) {
		return <ShippingTour showShippingRecommendationsStep={ false } />;
	}

	if (
		activePlugins.includes( 'woocommerce-services' ) &&
		isJetpackConnected
	) {
		return <ShippingTour showShippingRecommendationsStep={ false } />;
	}

	if ( countryCode !== 'US' || isSellingDigitalProductsOnly ) {
		return <ShippingTour showShippingRecommendationsStep={ false } />;
	}

	return (
		<>
			<ShippingTour showShippingRecommendationsStep={ true } />
			<ShippingRecommendationsList>
				<WooCommerceServicesItem
					isWCSInstalled={ installedPlugins.includes(
						'woocommerce-services'
					) }
				/>
			</ShippingRecommendationsList>
		</>
	);
};

export default ShippingRecommendations;
