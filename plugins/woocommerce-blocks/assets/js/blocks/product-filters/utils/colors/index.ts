/**
 * External dependencies
 */
import { paramCase as kebabCase } from 'change-case';

/**
 * Get CSS variable value for a given slug or value.
 *
 * @param {string} slug  Slug of the color.
 * @param {string} value Value of the color.
 * @return {string} CSS variable value.
 */
function getCSSVar(
	slug: string | undefined,
	value: string | undefined = ''
): string {
	if ( slug?.length ) {
		return `var(--wp--preset--color--${ slug })`;
	}

	return value;
}

/**
 * Get custom key for a given color.
 *
 * @param {string} color Color name.
 * @return {string} Custom key.
 */
function getCustomKey( color: string ): string {
	return `custom${ color.charAt( 0 ).toUpperCase() }${ color.slice( 1 ) }`;
}

export function getStyleColorVars(
	prefix: string,
	attributes: Record< string, unknown >,
	colors: string[]
): Record< string, string > {
	const styleVars: Record< string, string > = {};

	colors.forEach( ( color ) => {
		const normalColor = attributes[ color ] as string | undefined;
		const customKey = getCustomKey( color );
		const customColor = attributes[ customKey ];

		if (
			( typeof normalColor === 'string' && normalColor.length > 0 ) ||
			( typeof customColor === 'string' && customColor.length > 0 )
		) {
			styleVars[ `--${ prefix }-${ kebabCase( color ) }` ] = getCSSVar(
				normalColor,
				customColor as string
			);
		}
	} );

	return styleVars;
}

export function getHasColorClasses(
	attributes: Record< string, unknown >,
	colors: string[]
): Record< string, string | undefined > {
	const cssClasses: Record< string, string | undefined > = {};

	colors.forEach( ( attr ) => {
		if ( ! attr.startsWith( 'custom' ) ) {
			const customAttr = getCustomKey( attr );

			/*
			 * Generate class name based on the attribute name,
			 * transforming from camelCase to kebab-case.
			 * Example: `warningTextColor` -> `has-warning-text-color`.
			 */
			const className = `has-${ kebabCase( attr ) }-color`;

			cssClasses[ className ] = ( attributes[ attr ] ||
				attributes[ customAttr ] ) as string;
		}
	} );

	return cssClasses;
}
