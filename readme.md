# sigfig

Retrieve the amount of significant figures in a number or round a number to a certain amount of significant figures.

## Usage

```javascript
import sigfig from 'sigfig';

sigfig('9.9', 1); // "10"
sigfig('3.10194', 4); // "3.102"
sigfig('3.10194', 7); // "3.101940"
sigfig('0.00023224', 4); // "0.0002322"
```
