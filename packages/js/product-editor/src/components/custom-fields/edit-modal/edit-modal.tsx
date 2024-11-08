/**
 * External dependencies
 */
import { Button, Modal } from '@wordpress/components';
import { createElement, useState, useRef, useEffect } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { recordEvent } from '@woocommerce/tracks';
import classNames from 'classnames';
import type { FocusEvent } from 'react';

/**
 * Internal dependencies
 */
import { TRACKS_SOURCE } from '../../../constants';
import { TextControl } from '../../text-control';
import type { Metadata } from '../../../types';
import { type ValidationError, validate } from '../utils/validations';
import { CustomFieldNameControl } from '../custom-field-name-control';
import type { EditModalProps } from './types';

export function EditModal( {
	initialValue,
	values,
	onUpdate,
	onCancel,
	...props
}: EditModalProps ) {
	const [ customField, setCustomField ] =
		useState< Metadata< string > >( initialValue );
	const [ validationError, setValidationError ] =
		useState< ValidationError >();
	const keyInputRef = useRef< HTMLInputElement >( null );
	const valueInputRef = useRef< HTMLInputElement >( null );

	useEffect( function focusNameInputOnMount() {
		keyInputRef.current?.focus();
	}, [] );

	function renderTitle() {
		return sprintf(
			/* translators: %s: the name of the custom field */
			__( 'Edit %s', 'woocommerce' ),
			customField.key
		);
	}

	function changeHandler( prop: keyof Metadata< string > ) {
		return function handleChange( value: string | null ) {
			setCustomField( ( current ) => ( {
				...current,
				[ prop ]: value,
			} ) );
		};
	}

	function blurHandler( prop: keyof Metadata< string > ) {
		return function handleBlur( event: FocusEvent< HTMLInputElement > ) {
			const error = validate(
				{
					...customField,
					[ prop ]: event.target.value,
				},
				values
			);
			setValidationError( error );
		};
	}

	function handleUpdateButtonClick() {
		const errors = validate( customField, values );

		if ( errors.key || errors.value ) {
			setValidationError( errors );

			if ( errors.key ) {
				keyInputRef.current?.focus();
				return;
			}

			valueInputRef.current?.focus();
			return;
		}

		onUpdate( {
			...customField,
			key: customField.key.trim(),
			value: customField.value?.trim(),
		} );

		recordEvent( 'product_custom_fields_update_button_click', {
			source: TRACKS_SOURCE,
			custom_field_id: customField.id,
			custom_field_name: customField.key,
			prev_custom_field_name: initialValue.key,
		} );
	}

	return (
		<Modal
			shouldCloseOnClickOutside={ false }
			{ ...props }
			title={ renderTitle() }
			onRequestClose={ onCancel }
			className={ classNames(
				'woocommerce-product-custom-fields__edit-modal',
				props.className
			) }
		>
			<CustomFieldNameControl
				ref={ keyInputRef }
				label={ __( 'Name', 'woocommerce' ) }
				allowReset={ false }
				help={ validationError?.key }
				value={ customField.key }
				onChange={ changeHandler( 'key' ) }
				onBlur={ blurHandler( 'key' ) }
				className={ classNames( {
					'has-error': validationError?.key,
				} ) }
			/>

			<TextControl
				ref={ valueInputRef }
				label={ __( 'Value', 'woocommerce' ) }
				error={ validationError?.value }
				value={ customField.value }
				onChange={ changeHandler( 'value' ) }
				onBlur={ blurHandler( 'value' ) }
			/>

			<div className="woocommerce-product-custom-fields__edit-modal-actions">
				<Button variant="secondary" onClick={ onCancel }>
					{ __( 'Cancel', 'woocommerce' ) }
				</Button>

				<Button variant="primary" onClick={ handleUpdateButtonClick }>
					{ __( 'Update', 'woocommerce' ) }
				</Button>
			</div>
		</Modal>
	);
}
