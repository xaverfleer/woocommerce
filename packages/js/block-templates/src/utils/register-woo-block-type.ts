/**
 * External dependencies
 */
import {
	Block,
	BlockConfiguration,
	BlockEditProps,
	registerBlockType,
} from '@wordpress/blocks';
import { createElement } from '@wordpress/element';
import { evaluate } from '@woocommerce/expression-evaluation';
import { ComponentType } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types for this exist yet, natively (not until 7.0.0).
// Including `@types/wordpress__data` as a devDependency causes build issues,
// so just going type-free for now.
// eslint-disable-next-line @woocommerce/dependency-group
import { useSelect, select as WPSelect } from '@wordpress/data';

interface BlockRepresentation< T extends Record< string, object > > {
	name?: string;
	metadata: BlockConfiguration< T >;
	settings: Partial< BlockConfiguration< T > >;
}

type UseEvaluationContext = ( context: Record< string, unknown > ) => {
	getEvaluationContext: (
		select: typeof WPSelect
	) => Record< string, unknown >;
};

function defaultUseEvaluationContext( context: Record< string, unknown > ) {
	return {
		getEvaluationContext: () => context,
	};
}

function getEdit<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends Record< string, object > = Record< string, object >
>(
	edit: ComponentType< BlockEditProps< T > >,
	useEvaluationContext: UseEvaluationContext
): ComponentType< BlockEditProps< T > > {
	return ( props ) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore context is added to the block props by the block editor.
		const { context } = props;
		const {
			_templateBlockHideConditions: hideConditions,
			_templateBlockDisableConditions: disableConditions,
		} = props.attributes;

		const { getEvaluationContext } = useEvaluationContext( context );

		const { shouldHide, shouldDisable } = useSelect(
			( select: typeof WPSelect ) => {
				const evaluationContext = getEvaluationContext( select );

				return {
					shouldHide:
						hideConditions &&
						Array.isArray( hideConditions ) &&
						hideConditions.some( ( condition ) =>
							evaluate( condition.expression, evaluationContext )
						),
					shouldDisable:
						disableConditions &&
						Array.isArray( disableConditions ) &&
						disableConditions.some( ( condition ) =>
							evaluate( condition.expression, evaluationContext )
						),
				};
			},
			[ getEvaluationContext, hideConditions, disableConditions ]
		);

		if ( ! edit || shouldHide ) {
			return null;
		}

		return createElement( edit, {
			...props,
			attributes: {
				...props.attributes,
				disabled: props.attributes.disabled || shouldDisable,
			},
		} );
	};
}

function augmentAttributes<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends Record< string, any > = Record< string, any >
>( attributes: T ) {
	// Note: If you modify this function, also update the server-side
	// Automattic\WooCommerce\Admin\Features\ProductBlockEditor\BlockRegistry::augment_attributes() function.
	return {
		...attributes,
		...{
			_templateBlockId: {
				type: 'string',
				__experimentalRole: 'content',
			},
			_templateBlockOrder: {
				type: 'integer',
				__experimentalRole: 'content',
			},
			_templateBlockHideConditions: {
				type: 'array',
				__experimentalRole: 'content',
			},
			_templateBlockDisableConditions: {
				type: 'array',
				__experimentalRole: 'content',
			},
			disabled: attributes.disabled || {
				type: 'boolean',
				__experimentalRole: 'content',
			},
		},
	};
}

/**
 * Function to register an individual block.
 *
 * @param block The block to be registered.
 * @return The block, if it has been successfully registered; otherwise `undefined`.
 */
export function registerWooBlockType<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends Record< string, any > = Record< string, any >
>(
	block: BlockRepresentation< T >,
	useEvaluationContext?: UseEvaluationContext
): Block< T > | undefined {
	if ( ! block ) {
		return;
	}
	const { metadata, settings, name } = block;
	const { edit } = settings;

	if ( ! edit ) {
		return;
	}

	const augmentedMetadata = {
		...metadata,
		attributes: augmentAttributes( metadata.attributes ),
	};

	return registerBlockType< T >(
		{ name, ...augmentedMetadata },
		{
			...settings,
			edit: getEdit< T >(
				edit,
				useEvaluationContext ?? defaultUseEvaluationContext
			),
		}
	);
}
