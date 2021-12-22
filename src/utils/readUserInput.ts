import readline from 'readline';
import * as T from 'fp-ts/Task';

export const readUserInput = (prompt: string): T.Task<string> => {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return () =>
		new Promise((resolve) =>
			rl.question(prompt, (result) => {
				resolve(result);
				rl.close();
			})
		);
};
