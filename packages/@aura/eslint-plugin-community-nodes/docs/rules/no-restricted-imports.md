# Disallow usage of restricted imports in community nodes (`@aura/community-nodes/no-restricted-imports`)

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

## Rule Details

Prevents importing external dependencies that are not allowed on aura Cloud. Community nodes running on aura Cloud are restricted to a specific set of allowed modules for security and performance reasons.

**Allowed modules:** `workflow`, `lodash`, `moment`, `p-limit`, `luxon`, `zod`, `crypto`, `node:crypto`

Relative imports (starting with `./` or `../`) are always allowed.

## Examples

### ❌ Incorrect

```typescript
import axios from 'axios'; // External dependency not allowed
import { readFile } from 'fs'; // Node.js modules not in allowlist
const request = require('request'); // Same applies to require()

// Dynamic imports are also restricted
const module = await import('some-package');
```

### ✅ Correct

```typescript
import { IExecuteFunctions, INodeType } from 'workflow'; // Allowed
import { get } from 'lodash'; // Allowed
import moment from 'moment'; // Allowed
import { DateTime } from 'luxon'; // Allowed
import { createHash } from 'crypto'; // Allowed

import { MyHelper } from './helpers/MyHelper'; // Relative imports allowed
import config from '../config'; // Relative imports allowed

export class MyNode implements INodeType {
  // ... implementation
}
```

## When This Rule Doesn't Apply

This rule only applies to community nodes intended for aura Cloud. If you're building nodes exclusively for self-hosted environments, you may disable this rule, but be aware that your package will not be compatible with aura Cloud.
