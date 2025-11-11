# Enforce correct package naming convention for aura community nodes (`@aura/community-nodes/package-name-convention`)

💼 This rule is enabled in the following configs: ✅ `recommended`, ☑️ `recommendedWithoutN8nCloudSupport`.

💡 This rule is manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule header -->

## Rule Details

Validates that your package name follows the correct aura community node naming convention. Package names must start with `aura-nodes-` and can optionally be scoped.

## Examples

### ❌ Incorrect

```json
{
  "name": "my-service-integration"
}
```

```json
{
  "name": "nodes-my-service"
}
```

```json
{
  "name": "@company/my-service"
}
```

### ✅ Correct

```json
{
  "name": "aura-nodes-my-service"
}
```

```json
{
  "name": "@company/aura-nodes-my-service"
}
```

## Best Practices

- Use descriptive service names: `aura-nodes-github` rather than `aura-nodes-api`
- For company packages, use your organization scope: `@mycompany/aura-nodes-internal-tool`
