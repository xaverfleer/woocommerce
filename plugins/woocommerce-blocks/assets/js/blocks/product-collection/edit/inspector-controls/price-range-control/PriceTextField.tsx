/* eslint-disable @wordpress/no-unsafe-wp-apis */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { getCurrency } from '@woocommerce/price-format';
import { Currency } from '@woocommerce/types';
import { useState } from '@wordpress/element';
import {
	// @ts-expect-error Using experimental features
	__experimentalInputControl as InputControl,
	// @ts-expect-error Using experimental features
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
} from '@wordpress/components';

interface PriceTextFieldProps {
	value: number;
	onChange: ( value: number | undefined ) => void;
	label?: string;
}

const formatNumber = ( val: number, currency: Currency ): string => {
	// Round the number to the correct number of decimals
	const factor = Math.pow( 10, currency.minorUnit );
	const roundedValue = `${ Math.round( val * factor ) / factor }`;

	// Split the number into whole and decimal parts
	let [ whole, decimal ] = roundedValue.split( '.' );

	// Apply the thousand separator
	if ( currency.thousandSeparator ) {
		whole = whole.replace(
			/\B(?=(\d{3})+(?!\d))/g,
			currency.thousandSeparator
		);
	}

	// If there is no decimal part, we don't need to add decimal separator
	if ( ! decimal ) {
		return whole;
	}

	// Add the decimal separator to the number.
	const decimalSeparator = currency.decimalSeparator || '.';
	return `${ whole }${ decimalSeparator }${ decimal }`;
};

const formatNumberAsCurrency = (
	val: number | undefined,
	currency: Currency
) => {
	if ( val === undefined || isNaN( val ) ) {
		return undefined;
	}

	let formattedNumber = formatNumber( val, currency );

	/**
	 * Add the currency symbol to the number.
	 * For example, if the currency is USD, the value is 1000.00
	 * It should be converted to $1,000.00
	 */
	if ( currency?.prefix ) {
		formattedNumber = `${ currency.prefix }${ formattedNumber }`;
	}
	if ( currency?.suffix ) {
		formattedNumber = `${ formattedNumber }${ currency.suffix }`;
	}

	return formattedNumber;
};

const convertCurrencyStringToNumber = (
	currencyString = '',
	currency: Currency
): number | undefined => {
	/**
	 * 1. Remove all characters that are not numbers or the decimal separator.
	 * 2. Replace the decimal separator with a period.
	 */
	const cleanedCurrencyString = currencyString
		.replace(
			new RegExp( `[^0-9\\${ currency.decimalSeparator || '' }]`, 'g' ),
			''
		)
		.replace( new RegExp( `\\${ currency.decimalSeparator }`, 'g' ), '.' );

	const parsedNumericValue = Number( cleanedCurrencyString );
	if ( cleanedCurrencyString === '' || isNaN( parsedNumericValue ) ) {
		return undefined;
	}

	/**
	 * If the value is negative, return 0.
	 */
	if ( parsedNumericValue < 0 ) {
		return 0;
	}

	return parsedNumericValue;
};

const PriceTextField: React.FC< PriceTextFieldProps > = ( {
	value,
	onChange,
	label,
} ) => {
	const [ inputValue, setInputValue ] = useState< string >(
		`${ value || '' }`
	);

	const currency = getCurrency();
	const parsedNumericValue = convertCurrencyStringToNumber(
		inputValue,
		currency
	);
	const formattedValue = formatNumberAsCurrency(
		parsedNumericValue,
		currency
	);

	const handleOnChange = ( val: string ) => {
		setInputValue( val );
	};

	const handleOnBlur = () => {
		onChange( parsedNumericValue );
	};

	/**
	 * When the user presses the enter key, the new value should be saved.
	 */
	const handleEnterKeyPress = (
		event: React.KeyboardEvent< HTMLInputElement >
	) => {
		if ( event.key === 'Enter' ) {
			onChange( parsedNumericValue );
		}
	};

	return (
		<InputControl
			value={ formattedValue }
			onChange={ handleOnChange }
			onBlur={ handleOnBlur }
			onKeyDown={ handleEnterKeyPress }
			label={ label }
			prefix={
				<InputControlPrefixWrapper>{ label }</InputControlPrefixWrapper>
			}
			placeholder={ __( 'Auto', 'woocommerce' ) }
			hideLabelFromVision
			type="text"
			style={ {
				textAlign: 'right',
			} }
			__next40pxDefaultSize
		/>
	);
};

export default PriceTextField;
