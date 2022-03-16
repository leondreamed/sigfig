import fromExponential from 'from-exponential';

export function convertNumberToString(numberOrString: number | string): string {
	let numberString =
		typeof numberOrString === 'number'
			? numberOrString.toFixed(100)
			: numberOrString;

	if (Number.isNaN(Number(numberOrString))) {
		throw new TypeError(`${numberOrString} is not a number.`);
	}

	// Convert exponential to decimal format
	numberString = fromExponential(numberString);

	return numberString;
}

/**
Returns a normalized representation of the number, which includes:
- Leading zeros excluded
- Always a decimal point. If the number is a whole number, the decimal point is at the end of the number (1234.) If the absolute value of the number is less than 1, then the leading zero is omitted (.1234)
*/
export function normalizeNumberString(numberString: string) {
	// Remove the sign from the number
	const isNegative = numberString.startsWith('-');

	if (numberString.startsWith('+') || numberString.startsWith('-')) {
		numberString = numberString.slice(1);
	}

	// Add a decimal to the end of the number if number doesn't have explicit decimal place (i.e. whole number)
	if (!numberString.includes('.')) {
		numberString += '.';
	}

	// Remove leading zeros (zeros at the beginning)
	numberString = numberString.replace(/^0*(?!\.)/g, '');

	// If the number is 0.abc, replace it with .abc
	if (numberString.startsWith('0')) numberString = numberString.slice(1);

	return {
		isNegative,
		normalizedNumberString: numberString,
	};
}
