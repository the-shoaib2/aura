# aura Expression language support

## Usage

```js
import { parserWithMetaData as auraParser } from '@aura/codemirror-lang';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parseMixed } from '@lezer/common';
import { parser as jsParser } from '@lezer/javascript';

const auraPlusJsParser = auraParser.configure({
	wrap: parseMixed((node) => {
		if (node.type.isTop) return null;

		return node.name === 'Resolvable'
			? { parser: jsParser, overlay: (node) => node.type.name === 'Resolvable' }
			: null;
	}),
});

const auraLanguage = LRLanguage.define({ parser: auraPlusJsParser });

export function auraExpressionLanguageSupport() {
	return new LanguageSupport(auraLanguage);
}
```

## Supported Unicode ranges

- From `Basic Latin` up to and including `Currency Symbols`
- `Miscellaneous Symbols and Pictographs`
- `CJK Unified Ideographs`
