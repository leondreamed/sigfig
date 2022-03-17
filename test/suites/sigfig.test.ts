import { test, expect } from 'vitest';
import * as fc from 'fast-check';
import sigfig from '~/index.js';

test('rounds correctly', () => {
	const num1 = '3.10194';

	const num1Expected = [
		[1, '3'],
		[2, '3.1'],
		[3, '3.10'],
		[4, '3.102'],
		[5, '3.1019'],
		[6, '3.10194'],
		[7, '3.101940'],
		[8, '3.1019400'],
	] as const;

	for (const [numSigfigs, result] of num1Expected) {
		expect(sigfig(num1, numSigfigs)).toEqual(result);
		expect(sigfig(result)).toEqual(numSigfigs);
	}

	const num2 = '.1509';

	const num2Expected = [
		[1, '0.2'],
		[2, '0.15'],
		[3, '0.151'],
		[4, '0.1509'],
		[5, '0.15090'],
		[6, '0.150900'],
	] as const;

	for (const [numSigfigs, result] of num2Expected) {
		expect(sigfig(num2, numSigfigs)).toEqual(result);
		expect(sigfig(result)).toEqual(numSigfigs);
	}

	for (const num of ['429', '429.']) {
		expect(sigfig(num)).toEqual(3);
		expect(sigfig(num, 1)).toEqual('400');
		expect(sigfig(num, 2)).toEqual('430');
		expect(sigfig(num, 3)).toEqual('429');
		expect(sigfig(num, 4)).toEqual('429.0');
		expect(sigfig(num, 5)).toEqual('429.00');
	}

	expect(sigfig('0')).toEqual(1);
	expect(sigfig('0.')).toEqual(1);
	expect(sigfig('.0')).toEqual(1);
	expect(sigfig('0.0')).toEqual(1);
	expect(sigfig('0.00')).toEqual(2);
	expect(sigfig('0', 1)).toEqual('0');
	expect(sigfig('0', 2)).toEqual('0.00');

	expect(sigfig('0.00000000001')).toEqual(1);

	expect(sigfig('0.09500000000000008', 1)).toEqual('0.1');

	expect(sigfig('0.000109', 2)).toEqual('0.00011');
	expect(sigfig('1.0430812624750985e-7', 15)).toEqual(
		'0.000000104308126247510'
	);
	expect(sigfig('0.04760919500000005', 7)).toEqual('0.04760920');
	expect(sigfig('0.9500000029802322', 1)).toEqual('1');

	expect(sigfig('9.9', 1)).toEqual('10');
	expect(() => sigfig(Number.NaN, 1)).toThrow();
	expect(() => sigfig(1, Number.NaN)).toThrow();
	expect(() => sigfig(Number.NaN, Number.NaN)).toThrow();
	expect(() => sigfig('not a number', 1)).toThrow();
	expect(() => sigfig('42', 0)).toThrow();
	expect(() => sigfig('not a number', 0)).toThrow();
	expect(() => sigfig('42', 1.3)).toThrow();
});

test('fast check', () => {
	fc.assert(
		fc.property(
			fc.double(),
			fc.integer().filter((n) => n > 0 && n < 100_000),
			(number, numSigfigs) => {
				expect(sigfig(sigfig(number, numSigfigs))).toEqual(numSigfigs);
			}
		)
	);
});

test('fast check 2', () => {
	// Correctly rounds positive integers
	fc.assert(
		fc.property(
			fc.integer().filter((n) => n >= 1),
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
