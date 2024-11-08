/**
 * External dependencies
 */
import { Button as AriakitButton } from '@ariakit/react';
import { forwardRef } from '@wordpress/element';
import clsx from 'clsx';
import type { ForwardedRef } from 'react';
import type { ButtonProps as AriakitButtonProps } from '@ariakit/react';
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import './style.scss';
import Spinner from '../../../../../packages/components/spinner';

type WCButtonProps = AriakitButtonProps & { children?: React.ReactNode };

export interface ButtonProps extends WCButtonProps {
	/**
	 * Deprecated: Show a spinner. Preferably,
	 * render a spinner in the button children
	 * instead.
	 *
	 * @default false
	 */
	showSpinner?: boolean | undefined;
	/**
	 * Button variant
	 *
	 * @default 'contained'
	 */
	variant?: 'text' | 'contained' | 'outlined';
	/**
	 * By default we render a wrapper around  the button children,
	 * but you can opt in to removing it by setting removeTextWrap
	 * to true.
	 *
	 * @default false
	 */
	removeTextWrap?: boolean;
}

interface LinkProps extends ButtonProps {
	/**
	 * Button href
	 */
	href: string;
}

/**
 * Component that visually renders a button but semantically might be `<button>` or `<a>` depending
 * on the props.
 */
const Button = forwardRef< HTMLButtonElement, ButtonProps | LinkProps >(
	( props, ref ) => {
		if ( 'showSpinner' in props ) {
			deprecated( 'showSpinner prop', {
				version: '8.9.0',
				alternative: 'Render a spinner in the button children instead.',
				plugin: 'WooCommerce',
			} );
		}

		const {
			className,
			showSpinner = false,
			children,
			variant = 'contained',
			// To maintain backward compat we render a wrapper for button text by default,
			// but you can opt in to removing it by setting removeTextWrap to true.
			removeTextWrap = false,
			...rest
		} = props;

		const buttonClassName = clsx(
			'wc-block-components-button',
			'wp-element-button',
			className,
			variant,
			{
				'wc-block-components-button--loading': showSpinner,
			}
		);

		if ( 'href' in props ) {
			return (
				<AriakitButton
					render={
						<a
							ref={ ref as ForwardedRef< HTMLAnchorElement > }
							href={ props.href }
						>
							{ showSpinner && <Spinner /> }
							<span className="wc-block-components-button__text">
								{ children }
							</span>
						</a>
					}
					className={ buttonClassName }
					{ ...rest }
				/>
			);
		}

		const buttonChildren = removeTextWrap ? (
			props.children
		) : (
			<span className="wc-block-components-button__text">
				{ props.children }
			</span>
		);

		return (
			<AriakitButton
				ref={ ref }
				className={ buttonClassName }
				{ ...rest }
			>
				{ showSpinner && <Spinner /> }
				{ buttonChildren }
			</AriakitButton>
		);
	}
);

export default Button;
