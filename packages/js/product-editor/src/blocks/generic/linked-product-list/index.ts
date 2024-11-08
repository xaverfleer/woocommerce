/**
 * Internal dependencies
 */
import blockConfiguration from './block.json';
import { LinkedProductListBlockEdit } from './edit';
import { registerProductEditorBlockType } from '../../../utils';

const { name, ...metadata } = blockConfiguration;

export { metadata, name };

export const settings = {
	example: {},
	edit: LinkedProductListBlockEdit,
};

export function init() {
	return registerProductEditorBlockType( {
		name,
		metadata: metadata as never,
		settings: settings as never,
	} );
}
