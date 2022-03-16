import fromExponential from 'from-exponential';

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
	let numberString =
		typeof numberOrString === 'number'
			? numberOrString.toFixed(100)
			: numberOrString;

	if (Number.isNaN(Number(numberOrString))) {
		throw new TypeError(`${numberOrString} is not a number.`);
	}

	numberString = fromExponential(numberString);

	const isNegative = numberString.startsWith('-');

	// Remove the sign from the number
	if (numberString.startsWith('+') || numberString.startsWith('-')) {
		numberString = numberString.slice(1);
	}

	// Add a decimal to the end of the number if number doesn't have explicit decimal place (i.e. whole number)
	if (!numberString.includes('.')) {
		numberString += '.';
	}

	const decimalIndex = numberString.indexOf('.');
	const wholeNumberLength = decimalIndex;

	// Handle the case where the number contains all zeros
	if (/^[0.]+$/.test(numberString)) {
		if (numSigfigs === undefined) {
			if (numberString === '0.') return 1;
			return numberString.length - decimalIndex;
		} else {
			if (numSigfigs === 1) return '0';
			else return '0.' + '0'.repeat(numSigfigs - 1);
		}
	}

	const firstNonZeroDigitToLeftIndex = (() => {
		for (let i = decimalIndex - 1; i >= 0; i -= 1) {
			if (numberString[i] !== '0') {
				return i;
			}
		}

		return undefined;
	})();

	if (firstNonZeroDigitToLeftIndex === undefined) {
		numberString = numberString.slice(decimalIndex);
	}

	// By this point, a number will always be represented either .xyz or xyz.

	if (numSigfigs === undefined) {
		return numberString.length - 1;
	} else {
		const roundedDecimal = roundDecimal(numberString, numSigfigs);

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

/**
Rounds a decimal number so that it has exactly `numDigits` digits
*/
function roundDecimal(numberString: string, numDigits: number) {
	const digits = [];
	let roundingDigit: string | undefined;

	for (let i = 0, numDigitsEncountered = 0; i < numberString.length; i += 1) {
		const digit = numberString[i]!;
		digits.push(digit);
		if (digit >= '0' && digit <= '9') {
			numDigitsEncountered += 1;
			if (numDigitsEncountered === numDigits) {
				roundingDigit = numberString[i + 1]!;
				break;
			}
		}
	}

	if (roundingDigit === undefined || roundingDigit < '5') {
		return digits.join('');
	}

	let carry = false;
	for (let i = digits.length - 1; i > 0; i -= 1) {
		const digit = digits[i];
		if (digit === '9') {
			digits[i] = 0;
			carry = true;
		} else {
			digits[i] = String(Number(digit) + 1);
			break;
		}
	}

	if (carry) {
		digits.pop();
		digits.unshift('1');
	}

	return digits.join('');
}
