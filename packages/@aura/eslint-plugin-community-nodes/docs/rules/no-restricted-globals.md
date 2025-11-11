# Disallow usage of restricted global variables in community nodes (`@aura/community-nodes/no-restricted-globals`)

💼 This rule is enabled in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

## Rule Details

Prevents the use of Node.js global variables that are not allowed in aura Cloud. While these globals may be available in self-hosted environments, they are restricted on aura Cloud for security and stability reasons.

Restricted globals include: `clearInterval`, `clearTimeout`, `global`, `globalThis`, `process`, `setInterval`, `setTimeout`, `setImmediate`, `clearImmediate`, `__dirname`, `__filename`.

## Examples

### ❌ Incorrect

```typescript
export class MyNode implements INodeType {
  async execute(this: IExecuteFunctions) {
    // These globals are not allowed on aura Cloud
    const pid = process.pid;
    const dir = __dirname;

    setTimeout(() => {
      console.log('This will not work on aura Cloud');
    }, 1000);

    return this.prepareOutputData([]);
  }
}
```

### ✅ Correct

```typescript
export class MyNode implements INodeType {
  async execute(this: IExecuteFunctions) {
    // Use aura context methods instead
    const timezone = this.getTimezone();

    return this.prepareOutputData([]);
  }
}
```
