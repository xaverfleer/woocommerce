/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { WooOnboardingTask } from '@woocommerce/onboarding';
import { useSelect } from '@wordpress/data';
import {
	ONBOARDING_STORE_NAME,
	TaskType,
	DeprecatedTaskType,
} from '@woocommerce/data';

/**
 * Internal dependencies
 */
import { isTaskListActive } from '~/hooks/use-tasklists-state';

type MergedTask = TaskType | DeprecatedTaskType;

const DeprecatedWooOnboardingTaskFills = () => {
	const { isResolving, deprecatedTasks } = useSelect( ( select ) => {
		// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
		const taskLists = select( ONBOARDING_STORE_NAME ).getTaskLists();

		if ( ! taskLists || taskLists.length === 0 ) {
			return {
				isResolving: false,
				deprecatedTasks: [],
			};
		}

		const deprecatedTasksWithContainer: MergedTask[] = [];
		for ( const tasklist of taskLists ) {
			for ( const task of tasklist.tasks ) {
				if (
					'isDeprecated' in task &&
					task.isDeprecated &&
					'container' in task &&
					task.container
				) {
					deprecatedTasksWithContainer.push( task );
				}
			}
		}

		return {
			// @ts-expect-error Todo: awaiting more global fix, demo: https://github.com/woocommerce/woocommerce/pull/54146
			isResolving: select( ONBOARDING_STORE_NAME ).isResolving(
				'getTaskLists'
			),
			deprecatedTasks: deprecatedTasksWithContainer,
		};
	}, [] );

	if ( isResolving ) {
		return null;
	}

	return (
		<>
			{ deprecatedTasks.map( ( task ) => (
				<WooOnboardingTask
					id={ 'id' in task ? task.id : task.key }
					key={ 'id' in task ? task.id : task.key }
				>
					{ () => ( 'container' in task ? task.container : null ) }
				</WooOnboardingTask>
			) ) }
		</>
	);
};

registerPlugin( 'wc-admin-deprecated-task-container', {
	scope: 'woocommerce-tasks',
	render: () => {
		if ( isTaskListActive( 'setup' ) || isTaskListActive( 'extended' ) ) {
			return <DeprecatedWooOnboardingTaskFills />;
		}

		return null;
	},
} );
