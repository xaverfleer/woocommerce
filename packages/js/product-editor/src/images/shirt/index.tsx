/**
 * External dependencies
 */
import { SVG, Path } from '@wordpress/components';
import { createElement } from '@wordpress/element';

export function Shirt( {
	colorOne = '#E0E0E0',
	colorTwo = '#F0F0F0',
	size = 68,
	style = {},
} ) {
	const rate = 68 / 56;
	return (
		<SVG
			width={ size }
			height={ Math.round( size / rate ) }
			viewBox="0 0 68 56"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={ style }
		>
			<Path
				d="M43.0926 0.333984C41.0526 1.54732 37.5593 2.46732 34.2526 2.46732C30.946 2.46732 27.4526 1.54732 25.4126 0.333984L22.2793 10.5207H46.2126L43.106 0.333984H43.0926Z"
				fill={ colorOne }
			/>
			<Path
				d="M43.0927 0.333984C43.0927 4.09398 40.306 8.80065 34.2527 8.80065C28.1994 8.80065 25.4127 4.08065 25.4127 0.333984C15.546 0.333984 3.81268 7.45398 0.666016 10.6006L9.73269 24.7606L14.986 23.414L15.066 55.5606H53.4394L53.5194 23.414L58.7727 24.7606L67.8394 10.6006C64.6927 7.45398 52.9594 0.333984 43.0927 0.333984Z"
				fill={ colorTwo }
			/>
		</SVG>
	);
}
