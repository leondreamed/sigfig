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

	if (numberString.startsWith('.')) {
		numberString = '0' + numberString;
	}

	// Add a decimal to the end of the number if number doesn't have explicit decimal place
	if (!numberString.includes('.')) {
		numberString += '.';
	}

	const decimalIndex = numberString.indexOf('.');
	const wholeNumberLength = decimalIndex;

	// Handle the case where numbers to the right of the decimal place are all 0
	const firstNonZeroDigitToRightIndex = (() => {
		for (let i = decimalIndex + 1; i < numberString.length; i += 1) {
			if (numberString[i] !== '0') {
				return i;
			}
		}

		return undefined;
	})();

	if (firstNonZeroDigitToRightIndex === undefined) {
		numberString = numberString.slice(0, decimalIndex + 1);
	}

	const firstNonZeroDigitToLeftIndex = (() => {
		for (let i = decimalIndex - 1; i >= 0; i -= 1) {
			if (numberString[i] !== '0') {
				return i;
			}
		}

		return undefined;
	})();

	if (numSigfigs) {
		if (
			firstNonZeroDigitToLeftIndex === undefined &&
			firstNonZeroDigitToRightIndex !== undefined
		) {
			numSigfigs += 1;
		}

		const roundedDecimal = roundDecimal(numberString, numSigfigs);
		return roundedDecimal.padEnd(
			Math.max(
				wholeNumberLength,
				roundedDecimal.includes('.') ? numSigfigs + 1 : numSigfigs
			),
			'0'
		);
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
