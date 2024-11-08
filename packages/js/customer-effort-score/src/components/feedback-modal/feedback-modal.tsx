/**
 * External dependencies
 */
import { createElement, useState } from '@wordpress/element';
import PropTypes from 'prop-types';
import { Button, Modal } from '@wordpress/components';
import { Text } from '@woocommerce/experimental';
import classnames from 'classnames';

/**
 * Provides a modal requesting customer feedback.
 *
 * Answers and comments are sent to a callback function.
 *
 * @param {Object}   props                        Component props.
 * @param {Function} props.onSubmit               Function to call when the results are sent.
 * @param {string}   props.title                  Title displayed in the modal.
 * @param {string}   props.description            Description displayed in the modal.
 * @param {string}   props.isSubmitButtonDisabled Boolean to enable/disable the send button.
 * @param {string}   props.submitButtonLabel      Label for the send button.
 * @param {string}   props.cancelButtonLabel      Label for the cancel button.
 * @param {Function} props.onModalClose           Function to call when user closes modal by clicking X.
 * @param {Function} props.onCancel               Function to call when user presses cancel.
 * @param {Function} props.children               Children to be rendered.
 * @param {string}   props.className              Class name to add to the modal.
 */
function FeedbackModal( {
	onSubmit,
	title,
	description,
	onModalClose,
	onCancel,
	children,
	isSubmitButtonDisabled,
	submitButtonLabel,
	cancelButtonLabel,
	className,
}: {
	onSubmit: () => void;
	title: string;
	description?: string;
	onModalClose?: () => void;
	onCancel?: () => void;
	children?: JSX.Element;
	isSubmitButtonDisabled?: boolean;
	submitButtonLabel?: string;
	cancelButtonLabel?: string;
	className?: string;
} ): JSX.Element | null {
	const [ isOpen, setOpen ] = useState( true );

	const closeModal = () => {
		setOpen( false );
		if ( onModalClose ) {
			onModalClose();
		}
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className={ classnames( 'woocommerce-feedback-modal', className ) }
			title={ title }
			onRequestClose={ closeModal }
			shouldCloseOnClickOutside={ false }
		>
			{ description && (
				<Text
					variant="body"
					as="p"
					className="woocommerce-feedback-modal__description"
					size={ 14 }
					lineHeight="20px"
					marginBottom="1.5em"
				>
					{ description }
				</Text>
			) }
			{ children }
			<div className="woocommerce-feedback-modal__buttons">
				<Button isTertiary onClick={ onCancel } name="cancel">
					{ cancelButtonLabel }
				</Button>
				<Button
					isPrimary={ ! isSubmitButtonDisabled }
					isSecondary={ isSubmitButtonDisabled }
					onClick={ () => {
						onSubmit();
						setOpen( false );
					} }
					name="send"
					disabled={ isSubmitButtonDisabled }
				>
					{ submitButtonLabel }
				</Button>
			</div>
		</Modal>
	);
}

FeedbackModal.propTypes = {
	onSubmit: PropTypes.func.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	onModalClose: PropTypes.func,
	isSubmitButtonDisabled: PropTypes.bool,
	submitButtonLabel: PropTypes.string,
	cancelButtonLabel: PropTypes.string,
};

export { FeedbackModal };
