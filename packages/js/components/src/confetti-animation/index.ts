/**
 * External dependencies
 */
import confetti from 'canvas-confetti';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Note: This was copied over from https://github.com/Automattic/wp-calypso/blob/a39539547780871d0371a20fcf21c767a86a1010/packages/components/src/confetti/index.ts
 * since there was problems with importing @automattic/components:2.1.0 due to versions of its dependencies breaking wc core.
 * If we do not end up making further adjustments in this file that are not supported by the original implementation,
 * we should consider replacing it with the npm package when we're able to.
 */

const COLORS = [
	'#31CC9F',
	'#618DF2',
	'#6AB3D0',
	'#B35EB1',
	'#F2D76B',
	'#FAA754',
	'#E34C84',
];

type FireOptions = {
	spread: number;
	startVelocity?: number;
	decay?: number;
	scalar?: number;
};

function fireConfetti( colors: string[] ) {
	const count = 60;
	const scale = 2;
	const defaults = {
		origin: { y: 0.4 },
		colors,
		scalar: scale,
		spread: 180,
		gravity: 6,
	};

	function fire( particleRatio: number, opts: FireOptions ) {
		confetti(
			Object.assign( {}, defaults, opts, {
				particleCount: Math.floor( count * particleRatio ),
				startVelocity: opts.startVelocity
					? scale * opts.startVelocity
					: undefined,
				spread: scale * opts.spread,
				scalar: opts.scalar ? scale * opts.scalar : scale,
				// counter react-modal very high z index, always render the confetti on top
				zIndex: 1000000,
			} )
		);
	}

	fire( 0.25, {
		spread: 26,
		startVelocity: 55,
	} );
	fire( 0.2, {
		spread: 60,
	} );
	fire( 0.35, {
		spread: 100,
		decay: 0.91,
		scalar: 0.8,
	} );
	fire( 0.1, {
		spread: 120,
		startVelocity: 25,
		decay: 0.92,
		scalar: 1.2,
	} );
	fire( 0.1, {
		spread: 120,
		startVelocity: 45,
	} );
}

export const ConfettiAnimation = ( {
	trigger = true,
	delay = 0,
	colors = COLORS,
} ) => {
	const hasRun = useRef( false );

	useEffect( () => {
		if ( ! hasRun.current && trigger ) {
			setTimeout( () => fireConfetti( colors ), delay );
			hasRun.current = true;
		}
	}, [ trigger, delay, colors ] );

	return null;
};
