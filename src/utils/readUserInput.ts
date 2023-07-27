import readline from 'readline';
import { task } from 'fp-ts';

export const readUserInput = (prompt: string): task.Task<string> => {
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
