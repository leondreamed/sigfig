import { test, expect } from 'vitest';
import * as fc from 'fast-check';
import { sigfig } from '~/index.js';

test('rounds correctly', () => {
	const num1 = '3.10194';

	expect(sigfig(num1, 1)).toEqual('3');
	expect(sigfig(num1, 2)).toEqual('3.1');
	expect(sigfig(num1, 3)).toEqual('3.10');
	expect(sigfig(num1, 4)).toEqual('3.102');
	expect(sigfig(num1, 5)).toEqual('3.1019');
	expect(sigfig(num1, 6)).toEqual('3.10194');
	expect(sigfig(num1, 7)).toEqual('3.101940');
	expect(sigfig(num1, 8)).toEqual('3.1019400');

	const num2 = '.1509';

	expect(sigfig(num2, 1)).toEqual('0.2');
	expect(sigfig(num2, 2)).toEqual('0.15');
	expect(sigfig(num2, 3)).toEqual('0.151');
	expect(sigfig(num2, 4)).toEqual('0.1509');
	expect(sigfig(num2, 5)).toEqual('0.15090');
	expect(sigfig(num2, 6)).toEqual('0.150900');

	for (const num of ['429', '429.']) {
		expect(sigfig(num, 1)).toEqual('400');
		expect(sigfig(num, 2)).toEqual('430');
		expect(sigfig(num, 3)).toEqual('429');
		expect(sigfig(num, 4)).toEqual('429.0');
		expect(sigfig(num, 5)).toEqual('429.00');
	}

	expect(sigfig('0', 1)).toEqual('0');
	expect(sigfig('0', 2)).toEqual('0.0');

	// Correctly rounds positive integers
	fc.assert(
		fc.property(
			fc.integer().filter((n) => n >= 0),
			fc.integer().filter((n) => n > 0 && n < 100),
			(integer, numSigfigs) => {
				if (numSigfigs > String(integer).length) {
					expect(sigfig(integer, numSigfigs).length).toEqual(numSigfigs + 1);
				} else {
					expect(sigfig(integer, numSigfigs).length).toEqual(
						String(integer).length
					);
				}
			}
		)
	);
});
