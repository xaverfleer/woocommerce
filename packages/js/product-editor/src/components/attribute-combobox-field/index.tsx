/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	BaseControl,
	ComboboxControl as CoreComboboxControl,
	Spinner,
} from '@wordpress/components';
import {
	createElement,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import type {
	AttributesComboboxControlItem,
	AttributesComboboxControlComponent,
	ComboboxControlOption,
} from './types';

/*
 * Create an interface that includes
 * the `__experimentalRenderItem` property.
 */
interface ComboboxControlProps
	extends Omit< CoreComboboxControl.Props, 'label' | 'help' > {
	__experimentalRenderItem?: ( args: {
		item: ComboboxControlOption;
	} ) => string | JSX.Element;
}

/*
 * Create an alias for the ComboboxControl core component,
 * but with the custom ComboboxControlProps interface.
 */
const ComboboxControl =
	CoreComboboxControl as React.ComponentType< ComboboxControlProps >;

type ComboboxControlOptionProps = {
	item: ComboboxControlOption;
};

/**
 * Map the product attribute item to the Combobox core option.
 *
 * @param {AttributesComboboxControlItem} attr - Product attribute item.
 * @return {ComboboxControlOption}               Combobox option.
 */
function mapItemToOption(
	attr: AttributesComboboxControlItem
): ComboboxControlOption {
	return {
		label: attr.name,
		value: `attr-${ attr.id }`,
		disabled: !! attr.isDisabled,
	};
}

const createNewAttributeOptionDefault: ComboboxControlOption = {
	label: '',
	value: '',
	state: 'draft',
};

/**
 * ComboboxControlOption component.
 *
 * @param {ComboboxControlOptionProps} props - props.
 * @return {JSX.Element}                       Component item.
 */
function ComboboxControlOption(
	props: ComboboxControlOptionProps
): JSX.Element {
	const { item } = props;
	if ( item.disabled ) {
		return <div className="item-wrapper is-disabled">{ item.label }</div>;
	}

	return <div className="item-wrapper">{ item.label }</div>;
}

const AttributesComboboxControl: React.FC<
	AttributesComboboxControlComponent
> = ( {
	label,
	help,
	current = null,
	items = [],
	instanceNumber = 0,
	isLoading = false,
	onAddNew,
	onChange,
} ) => {
	const [ createNewAttributeOption, updateCreateNewAttributeOption ] =
		useState< ComboboxControlOption >( createNewAttributeOptionDefault );

	/**
	 * Map the items to the Combobox options.
	 * Each option is an object with a label and value.
	 * Both are strings.
	 */
	const attributeOptions: ComboboxControlOption[] =
		items?.map( mapItemToOption );

	const options = useMemo( () => {
		if ( ! createNewAttributeOption.label.length ) {
			return attributeOptions;
		}

		return [
			...attributeOptions,
			{
				label:
					createNewAttributeOption.state === 'draft'
						? sprintf(
								/* translators: The name of the new attribute term to be created */
								__( 'Create "%s"', 'woocommerce' ),
								createNewAttributeOption.label
						  )
						: createNewAttributeOption.label,
				value: createNewAttributeOption.value,
			},
		];
	}, [ attributeOptions, createNewAttributeOption ] );

	// Get current of the selected item.
	let currentValue = current ? `attr-${ current.id }` : '';
	if ( createNewAttributeOption.state === 'creating' ) {
		currentValue = 'create-attribute';
	}

	const comboRef = useRef< HTMLDivElement | null >( null );

	// Label to link the input with the label.
	const [ labelFor, setLabelFor ] = useState< string >( '' );

	useEffect( () => {
		if ( ! comboRef?.current ) {
			return;
		}

		/*
		 * Hack to set the base control ID,
		 * to link the label with the input,
		 * picking the input ID from the ComboboxControl.
		 */
		const inputElement = comboRef.current.querySelector(
			'input.components-combobox-control__input'
		);

		const id = inputElement?.getAttribute( 'id' );
		if ( inputElement && typeof id === 'string' ) {
			setLabelFor( id );
		}

		/*
		 * Hack to handle AttributesComboboxControl instances z index,
		 * avoiding to overlap the dropdown instances list.
		 * Todo: this is a temporary/not-ideal solution.
		 * It should be handled by the core ComboboxControl component.
		 */
		const listContainerElement = comboRef.current.querySelector(
			'.components-combobox-control__suggestions-container'
		) as HTMLElement;
		const style = { zIndex: 1000 - instanceNumber };

		if ( listContainerElement ) {
			Object.assign( listContainerElement.style, style );
		}
	}, [ instanceNumber ] );

	if ( ! help ) {
		help = (
			<div className="woocommerce-attributes-combobox-help">
				{ __(
					'Select an attribute or type to create.',
					'woocommerce'
				) }
			</div>
		);

		if ( isLoading ) {
			help = (
				<div className="woocommerce-attributes-combobox-help">
					<Spinner />
					{ __( 'Loading…', 'woocommerce' ) }
				</div>
			);
		} else if ( ! items.length ) {
			help = (
				<div className="woocommerce-attributes-combobox-help">
					{ __(
						'No attributes yet. Type to create.',
						'woocommerce'
					) }
				</div>
			);
		}
	}

	return (
		<div
			className={ classnames(
				'woocommerce-attributes-combobox-container',
				{
					'no-items': ! options.length,
				}
			) }
			ref={ comboRef }
		>
			<BaseControl label={ label } help={ help } id={ labelFor }>
				<ComboboxControl
					className="woocommerce-attributes-combobox"
					allowReset={ false }
					options={ options }
					value={ currentValue }
					onChange={ ( newValue ) => {
						if ( ! newValue ) {
							return;
						}

						if ( newValue === 'create-attribute' ) {
							updateCreateNewAttributeOption( {
								...createNewAttributeOption,
								state: 'creating',
							} );

							return onAddNew?.( createNewAttributeOption.label );
						}

						const selectedAttribute = items?.find(
							( item ) =>
								item.id ===
								Number( newValue.replace( 'attr-', '' ) )
						);

						/*
						 * Do not select when it is disabled.
						 * `disabled` item option should be
						 * handled by the core ComboboxControl component.
						 */
						if (
							! selectedAttribute ||
							selectedAttribute.isDisabled
						) {
							return;
						}

						onChange( selectedAttribute );
					} }
					onFilterValueChange={ ( filterValue: string ) => {
						updateCreateNewAttributeOption( {
							label: filterValue,
							value: 'create-attribute',
							state: 'draft',
						} );
					} }
					__experimentalRenderItem={ ComboboxControlOption }
				/>
			</BaseControl>
		</div>
	);
};

export default AttributesComboboxControl;
