/**
 * External dependencies
 */
import { Command } from '@commander-js/extra-typings';
import { ErrorCode, WebClient } from '@slack/web-api';
import { basename } from 'path';
import { existsSync } from 'fs';

/**
 * Internal dependencies
 */
import { Logger } from '../../../core/logger';

export const slackFileCommand = new Command( 'file' )
	.description( 'Send a file upload message to a slack channel' )
	.argument(
		'<token>',
		'Slack authentication token bearing required scopes.'
	)
	.argument( '<text>', 'Text based message to send to the slack channel.' )
	.argument( '<filePath>', 'File path to upload to the slack channel.' )
	.argument(
		'<channelIds...>',
		'Slack channel IDs to send the message to. Pass as many as you like.'
	)
	.option(
		'--dont-fail',
		'Do not fail the command if a message fails to send to any channel.'
	)
	.option(
		'--reply-ts <replyTs>',
		'Reply to the message with the corresponding ts'
	)
	.option(
		'--filename <filename>',
		'If provided, the filename that will be used for the file on Slack.'
	)
	.action(
		async (
			token,
			text,
			filePath,
			channels,
			{ dontFail, replyTs, filename }
		) => {
			Logger.startTask(
				`Attempting to send message to Slack for channels: ${ channels.join(
					','
				) }`
			);

			const shouldFail = ! dontFail;

			if ( filePath && ! existsSync( filePath ) ) {
				Logger.error(
					`Unable to open file with path: ${ filePath }`,
					shouldFail
				);
			}

			const client = new WebClient( token );

			for ( const channel of channels ) {
				try {
					const requestOptions = {
						file: filePath,
						filename: filename ? filename : basename( filePath ),
						channel_id: channel,
						initial_comment: text.replace( /\\n/g, '\n' ),
						request_file_info: false,
						thread_ts: replyTs ? replyTs : null,
					};

					await client.files.uploadV2( requestOptions );

					Logger.notice(
						`Successfully uploaded ${ filePath } to channel: ${ channel }`
					);
				} catch ( e ) {
					if (
						'code' in e &&
						e.code === ErrorCode.PlatformError &&
						'message' in e &&
						e.message.includes( 'missing_scope' )
					) {
						Logger.error(
							`The provided token does not have the required scopes, please add files:write and chat:write to the token.`,
							shouldFail
						);
					} else {
						Logger.error( e, shouldFail );
					}
				}
			}

			Logger.endTask();
		}
	);
