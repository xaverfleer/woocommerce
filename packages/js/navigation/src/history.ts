/**
 * External dependencies
 */
import { BrowserHistory, createBrowserHistory, Location } from 'history';
import { parse } from 'qs';

// See https://github.com/ReactTraining/react-router/blob/master/FAQ.md#how-do-i-access-the-history-object-outside-of-components
// ^ This is a bit outdated but there's no newer documentation - the replacement for this is to use <unstable_HistoryRouter /> https://reactrouter.com/docs/en/v6/routers/history-router

interface WooLocation extends Location {
	pathname: string;
}

/**
 * Extension of history.BrowserHistory but also adds { pathname: string } to the location object.
 */
export interface WooBrowserHistory extends BrowserHistory {
	location: WooLocation;
	readonly __experimentalLocationStack: WooLocation[];
}

let _history: WooBrowserHistory;

/**
 * Recreate `history` to coerce React Router into accepting path arguments found in query
 * parameter `path`, allowing a url hash to be avoided. Since hash portions of the url are
 * not sent server side, full route information can be detected by the server.
 *
 * `<Router />` and `<Switch />` components use `history.location()` to match a url with a route.
 * Since they don't parse query arguments, recreate `get location` to return a `pathname` with the
 * query path argument's value.
 *
 * In react-router v6, { basename } is no longer a parameter in createBrowserHistory(), and the
 * replacement is to use basename in the <Route> component.
 *
 * @return {Object} React-router history object with `get location` modified.
 */
function getHistory(): WooBrowserHistory {
	if ( ! _history ) {
		const browserHistory = createBrowserHistory();
		let locationStack: WooLocation[] = [ browserHistory.location ];

		const updateNextLocationStack = (
			action: WooBrowserHistory[ 'action' ],
			location: WooBrowserHistory[ 'location' ]
		) => {
			switch ( action ) {
				case 'POP':
					locationStack = locationStack.slice(
						0,
						locationStack.length - 1
					);
					break;
				case 'PUSH':
					locationStack = [ ...locationStack, location ];
					break;
				case 'REPLACE':
					locationStack = [
						...locationStack.slice( 0, locationStack.length - 1 ),
						location,
					];
					break;
			}
		};

		_history = {
			get action() {
				return browserHistory.action;
			},
			get location() {
				const { location } = browserHistory;
				const query = parse( location.search.substring( 1 ) );
				let pathname: string;

				if ( query && typeof query.path === 'string' ) {
					pathname = query.path;
				} else if (
					query &&
					query.path &&
					typeof query.path !== 'string'
				) {
					// this branch was added when converting to TS as it is technically possible for a query.path to not be a string.
					// eslint-disable-next-line no-console
					console.warn(
						`Query path parameter should be a string but instead was: ${ query.path }, undefined behaviour may occur.`
					);
					pathname = query.path as unknown as string; // ts override only, no coercion going on
				} else {
					pathname = '/';
				}
				return {
					...location,
					pathname,
				};
			},
			get __experimentalLocationStack() {
				return [ ...locationStack ];
			},
			createHref: browserHistory.createHref,
			push: browserHistory.push,
			replace: browserHistory.replace,
			go: browserHistory.go,
			back: browserHistory.back,
			forward: browserHistory.forward,
			block: browserHistory.block,
			listen( listener ) {
				return browserHistory.listen( () => {
					listener( {
						action: this.action,
						location: this.location,
					} );
				} );
			},
		};

		browserHistory.listen( () =>
			updateNextLocationStack( _history.action, _history.location )
		);
	}
	return _history;
}

export { getHistory };
