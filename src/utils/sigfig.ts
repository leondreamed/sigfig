/* eslint-disable complexity */

import {
	convertNumberToString,
	normalizeNumberString,
} from '~/utils/number.js';

function getFirstNonZeroDigitToRightIndex(num: string) {
	for (let i = num.indexOf('.') + 1; i < num.length; i += 1) {
		if (num[i] !== '0') return i;
	}

	return undefined;
}

/**
Returns number of significant figures
*/
export function sigfig(numberOrString: string | number): number;

/**
Rounds a number to a certain number of significant figures.
@returns The number rounded to `numSigfigs` significant figures (as a string).
*/
export function sigfig(
	numberOrString: string | number,
	numSigfigs: number
): string;

export function sigfig(
	numberOrString: string | number,
	numSigfigs?: number
): number | string {
	if (
		numSigfigs !== undefined &&
		(numSigfigs <= 0 || !Number.isInteger(numSigfigs))
	) {
		throw new TypeError(
			'The number of significant figures to round to must be an integer greater than 0.'
		);
	}

	const { normalizedNumberString: numberString, isNegative } =
		normalizeNumberString(convertNumberToString(numberOrString));

	// By this point, a number will always be represented either .xyz or xyz.

	const decimalIndex = numberString.indexOf('.');

	// Handle the case when there are only zeros in the number
	if (/^[0.]+$/.test(numberString)) {
		if (numSigfigs === undefined) {
			if (numberString === '.') return 1;
			else return numberString.length - 1;
		} else {
			if (numSigfigs === 1) {
				return '0';
			} else {
				return `0.${'0'.repeat(numSigfigs)}`;
			}
		}
	}

	const firstNonZeroDigitToRightIndex =
		getFirstNonZeroDigitToRightIndex(numberString);

	if (numSigfigs === undefined) {
		if (numberString.startsWith('.')) {
			return numberString.length - firstNonZeroDigitToRightIndex!;
		} else {
			return numberString.length - 1;
		}
	} else {
		const roundedDecimal = roundDecimal(numberString, numSigfigs);
		const wholeNumberLength = decimalIndex;

		let answer = roundedDecimal.padEnd(
			Math.max(
				wholeNumberLength,
				roundedDecimal.includes('.') ? numSigfigs + 1 : numSigfigs
			),
			'0'
		);

		// Normalizing the answer
		if (answer.startsWith('.')) {
			answer = '0' + answer;
		}

		if (answer.endsWith('.')) {
			answer = answer.slice(0, -1);
		}

		return isNegative ? `-${answer}` : answer;
	}
}

function roundDecimal(numberString: string, numSigfigs: number) {
	const digits = [];
	let roundingDigit: string | undefined;
	let firstNonZeroDigitIndex: number | undefined;
	let numSigfigsEncountered = 0;

	if (numberString.startsWith('.')) numberString = '0' + numberString;

	for (let i = 0; i < numberString.length; i += 1) {
		const digit = numberString[i]!;
		digits.push(digit);

		if (
			firstNonZeroDigitIndex === undefined &&
			digit !== '0' &&
			digit !== '.'
		) {
			firstNonZeroDigitIndex = i;
		}

		if (firstNonZeroDigitIndex !== undefined && digit >= '0' && digit <= '9') {
			numSigfigsEncountered += 1;
			if (numSigfigsEncountered === numSigfigs) {
				roundingDigit =
					(numberString[i + 1] === '.'
						? numberString[i + 2]
						: numberString[i + 1]) ?? '0';
				break;
			}
		}
	}

	if (firstNonZeroDigitIndex === undefined) {
		throw new Error('firstNonZeroDigitIndex should not be undefined');
	}

	for (let i = numSigfigsEncountered; i < numSigfigs; i += 1) {
		digits.push('0');
	}

	if (roundingDigit === undefined || roundingDigit < '5') {
		return digits.join('');
	}

	let carry = false;
	for (let i = digits.length - 1; i >= 0; i -= 1) {
		const digit = digits[i];
		if (digit === '.') {
			continue;
		}

		if (digit === '9') {
			digits[i] = 0;
			carry = true;
		} else {
			if (i < firstNonZeroDigitIndex) {
				digits.pop();
			}

			digits[i] = String(Number(digit) + 1);
			carry = false;
			break;
		}
	}

	// The first digit is now a "0"
	if (carry) {
		digits.unshift('1');
	}

	if (digits.at(-1) === '.') digits.pop();

	return digits.join('');
}
