<?php

use Automattic\WooCommerce\Internal\DataStores\Orders\DataSynchronizer;
use Automattic\WooCommerce\Internal\DataStores\Orders\OrdersTableDataStore;
use Automattic\WooCommerce\Utilities\OrderUtil;

/**
 * Base class for HPOS related unit test suites.
 */
class HposTestCase extends WC_Unit_Test_Case {

	/**
	 * Assert that a given order record exists or doesn't exist.
	 *
	 * @param int    $order_id The order id to check.
	 * @param bool   $in_cot True to assert that the order exists or not in the orders table, false to check in the posts table.
	 * @param bool   $must_exist True to assert that the order exists, false to check that the order doesn't exist.
	 * @param string $order_type Expected order type, null to accept any type that starts with "shop_order".
	 * @return void
	 */
	protected function assert_order_record_existence( $order_id, $in_cot, $must_exist, $order_type = null ) {
		global $wpdb;

		$table_name = $in_cot ? OrdersTableDataStore::get_orders_table_name() : $wpdb->posts;
		$order_type = $order_type ?? 'shop_order%';
		$sql        = $in_cot ?
			"SELECT EXISTS (SELECT id FROM $table_name WHERE id = %d)" :
			"SELECT EXISTS (SELECT ID FROM $table_name WHERE ID = %d AND post_type LIKE %s)";

		//phpcs:disable WordPress.DB.PreparedSQL.NotPrepared
		$exists = $wpdb->get_var(
			$in_cot ?
				$wpdb->prepare( $sql, $order_id ) :
				$wpdb->prepare( $sql, $order_id, $order_type )
		);
		//phpcs:enable WordPress.DB.PreparedSQL.NotPrepared

		if ( $must_exist ) {
			$this->assertTrue( (bool) $exists, "No order found with id $order_id in table $table_name" );
		} else {
			$this->assertFalse( (bool) $exists, "Unexpected order found with id $order_id in table $table_name" );
		}
	}

	/**
	 * Assert that an order deletion record exists or doesn't exist in the orders meta table.
	 *
	 * @param int  $order_id The order id to check.
	 * @param bool $deleted_from_cot True to assert that the record corresponds to an order deleted from the orders table, or from the posts table otherwise.
	 * @param bool $must_exist True to assert that the record exists, false to assert that the record doesn't exist.
	 * @return void
	 */
	protected function assert_deletion_record_existence( $order_id, $deleted_from_cot, $must_exist = true ) {
		global $wpdb;

		$meta_table_name = OrdersTableDataStore::get_meta_table_name();
		//phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$record = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT meta_value FROM $meta_table_name WHERE order_id = %d AND meta_key = %s",
				$order_id,
				DataSynchronizer::DELETED_RECORD_META_KEY
			),
			ARRAY_A
		);
		//phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		if ( $must_exist ) {
			$this->assertNotNull( $record, "No deletion record found for order id {$order_id}" );
		} else {
			$this->assertNull( $record, "Unexpected deletion record found for order id {$order_id}" );
			return;
		}

		$deleted_from = $deleted_from_cot ?
			DataSynchronizer::DELETED_FROM_ORDERS_META_VALUE :
			DataSynchronizer::DELETED_FROM_POSTS_META_VALUE;

		$this->assertEquals( $deleted_from, $record['meta_value'], "Deletion record for order {$order_id} has a value of {$record['meta_value']}, expected {$deleted_from}" );
	}

	/**
	 * Synchronize all the pending unsynchronized orders.
	 */
	protected function do_cot_sync() {
		$sync  = wc_get_container()->get( DataSynchronizer::class );
		$batch = $sync->get_next_batch_to_process( 100 );
		$sync->process_batch( $batch );
	}

	/**
	 * Sets an order as updated by directly modifying its "last updated gmt" field in the database.
	 *
	 * @param \WC_Order|int $order_or_id An order or an order id.
	 * @param string|null   $update_date The new value for the "last updated gmt" in the database, defaults to the current date and time.
	 * @param bool|null     $cot_is_authoritative Whether the orders table is authoritative or not. If null, it will be determined using OrderUtil.
	 * @return void
	 */
	protected function set_order_as_updated( $order_or_id, ?string $update_date = null, ?bool $cot_is_authoritative = null ) {
		global $wpdb;

		$order_id = $order_or_id instanceof \WC_Order ? $order_or_id->get_id() : $order_or_id;

		$update_date          = $update_date ?? current_time( 'mysql' );
		$cot_is_authoritative = $cot_is_authoritative ?? OrderUtil::custom_orders_table_usage_is_enabled();

		if ( $cot_is_authoritative ) {
			$wpdb->update(
				OrdersTableDataStore::get_orders_table_name(),
				array(
					'date_updated_gmt' => $update_date,
				),
				array( 'id' => $order_id )
			);
		} else {
			$wpdb->update(
				$wpdb->posts,
				array(
					'post_modified_gmt' => $update_date,
				),
				array( 'id' => $order_id )
			);
		}
	}
}
