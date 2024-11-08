/* eslint-disable no-console */

/**
 * External dependencies
 */
import { chromium, request } from '@playwright/test';
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';
import {
	BASE_URL,
	adminFile,
	wpCLI,
	customerFile,
	BLOCK_THEME_SLUG,
	DB_EXPORT_FILE,
} from '@woocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import { customer, admin } from './test-data/data/data';

const prepareAttributes = async () => {
	const browser = await chromium.launch();
	const context = await browser.newContext( {
		baseURL: BASE_URL,
		storageState: adminFile,
	} );

	const page = await context.newPage();

	// Intercept the dialog event. This is needed because when the regenerate
	// button is clicked, a dialog is shown.
	page.on( 'dialog', ( dialog ) => {
		void dialog.accept();
	} );

	await page.goto( '/wp-admin/admin.php?page=wc-status&tab=tools' );

	// Attributes regeneration should be doable via a CLI command, e.g.:
	// "wp wc tool run regenerate_product_attributes_lookup_table --user=1"
	// It doesn't seem to be working correctly ATM so we need to do it via
	// browser actions.
	// See: https://github.com/woocommerce/woocommerce/issues/32831
	await page
		.getByRole( 'row', {
			name: /Regenerate the product attributes lookup table/,
		} )
		.getByRole( 'button' )
		.click();

	await context.close();
	await browser.close();

	// Note that the two commands below are intentionally duplicated as we need
	// to run the cron task twice as we need to process more than 1 batch of
	// items.
	const cronTask =
		'action-scheduler run --hooks="woocommerce_run_product_attribute_lookup_regeneration_callback"';
	await wpCLI( cronTask );
	await wpCLI( cronTask );
};

async function globalSetup() {
	console.log( 'Running global setup:' );
	console.time( '└ Total time' );

	let databaseImported = false;

	try {
		await wpCLI( `db import ${ DB_EXPORT_FILE }` );
		console.log( '├ Database snapshot imported, running basic setup…' );
		databaseImported = true;
	} catch ( error ) {
		if (
			error instanceof Error &&
			! error.message.includes( 'Import file missing' )
		) {
			// Throw if the error is not related to the import file missing.
			throw error;
		}

		console.log( '├ Database snapshot not found, running full setup…' );
	}

	const requestContext = await request.newContext( {
		baseURL: BASE_URL,
	} );

	console.log( '├ Pre-authenticating users…' );
	await new RequestUtils( requestContext, {
		user: customer,
		storageStatePath: customerFile,
	} ).setupRest();
	const requestUtils = new RequestUtils( requestContext, {
		user: admin,
		storageStatePath: adminFile,
	} );
	await requestUtils.setupRest();

	if ( ! databaseImported ) {
		console.log( '├ Activating default theme…' );
		await requestUtils.activateTheme( BLOCK_THEME_SLUG );

		console.log( '├ Preparing product attributes…' );
		await prepareAttributes();
	}

	console.log( '├ Exporting database snapshot…' );
	await wpCLI( `db export ${ DB_EXPORT_FILE }` );

	await requestContext.dispose();
	console.timeEnd( '└ Total time' );
}

export default globalSetup;
