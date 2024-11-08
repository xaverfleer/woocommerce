/**
 * External dependencies
 */
import { Notice } from '@wordpress/notices';
import { Page } from '@playwright/test';
import { Admin, wpCLI } from '@woocommerce/e2e-utils';

type Location = {
	name: string;
	address: string;
	city: string;
	postcode: string;
	state: string;
	details: string;
};

export class LocalPickupUtils {
	private page: Page;
	private admin: Admin;

	constructor( page: Page, admin: Admin ) {
		this.page = page;
		this.admin = admin;
	}

	async openLocalPickupSettings() {
		await this.admin.visitAdminPage(
			'admin.php',
			'page=wc-settings&tab=shipping&section=pickup_location'
		);
	}

	async saveLocalPickupSettings() {
		await this.page.getByRole( 'button', { name: 'Save changes' } ).click();
		await this.page.waitForFunction( () => {
			return window.wp.data
				.select( 'core/notices' )
				.getNotices()
				.some(
					( notice: Notice ) =>
						notice.status === 'success' &&
						notice.content ===
							'Local Pickup settings have been saved.'
				);
		} );
	}

	async enableLocalPickup() {
		await this.openLocalPickupSettings();

		// Since we can only save if the form is changed, check first if a change is needed.
		if (
			! ( await this.page
				.getByLabel( 'Enable local pickup' )
				.isChecked() )
		) {
			await this.page.getByLabel( 'Enable local pickup' ).check();

			await this.saveLocalPickupSettings();
		}
	}

	async disableLocalPickup() {
		await this.openLocalPickupSettings();

		// Since we can only save if the form is changed, check first if a change is needed.
		const enabled = this.page.getByLabel( 'Enable local pickup' );
		if ( await enabled.isChecked() ) {
			await enabled.uncheck();

			await this.saveLocalPickupSettings();
		}
	}

	async enableLocalPickupCosts() {
		await this.openLocalPickupSettings();

		const addAPrice = this.page.getByLabel(
			'Add a price for customers who choose local pickup'
		);

		if ( ! ( await addAPrice.isChecked() ) ) {
			await addAPrice.check();
		}

		await this.saveLocalPickupSettings();
	}

	async disableLocalPickupCosts() {
		await this.openLocalPickupSettings();

		// Since we can only save if the form is changed, check first if a change is needed.
		const addAPrice = this.page.getByLabel(
			'Add a price for customers who choose local pickup'
		);

		if ( await addAPrice.isChecked() ) {
			await addAPrice.uncheck();

			await this.saveLocalPickupSettings();
		}
	}

	async setLocalPickupTitle( title: string ) {
		await this.openLocalPickupSettings();
		await this.page.getByLabel( 'Title' ).fill( title );
		await this.saveLocalPickupSettings();
	}

	async deleteLocations() {
		await wpCLI( "option update pickup_location_pickup_locations ''" );
	}

	async deletePickupLocation() {
		await this.page.getByRole( 'button', { name: 'Edit' } ).click();
		await this.page
			.getByRole( 'button', { name: 'Delete location' } )
			.click();

		await this.saveLocalPickupSettings();
	}

	async addPickupLocation( { location }: { location: Location } ) {
		await this.openLocalPickupSettings();

		await this.page.getByText( 'Add pickup location' ).click();
		await this.page.getByLabel( 'Location name' ).fill( location.name );
		await this.page.getByPlaceholder( 'Address' ).fill( location.address );
		await this.page.getByPlaceholder( 'City' ).fill( location.city );
		await this.page
			.getByPlaceholder( 'Postcode / ZIP' )
			.fill( location.postcode );
		await this.page
			.getByLabel( 'Country / State' )
			.selectOption( location.state );
		await this.page.getByLabel( 'Pickup details' ).fill( location.details );
		await this.page.getByRole( 'button', { name: 'Done' } ).click();

		await this.saveLocalPickupSettings();
	}

	async editPickupLocation( { location }: { location: Location } ) {
		await this.page.getByRole( 'button', { name: 'Edit' } ).click();
		await this.page.getByLabel( 'Location name' ).fill( location.name );
		await this.page.getByPlaceholder( 'Address' ).fill( location.address );
		await this.page.getByPlaceholder( 'City' ).fill( location.city );
		await this.page
			.getByPlaceholder( 'Postcode / ZIP' )
			.fill( location.postcode );
		await this.page
			.getByLabel( 'Country / State' )
			.selectOption( location.state );
		await this.page.getByLabel( 'Pickup details' ).fill( location.details );
		await this.page.getByRole( 'button', { name: 'Done' } ).click();

		await this.saveLocalPickupSettings();
	}
}
