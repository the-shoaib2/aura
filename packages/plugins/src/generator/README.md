# Integration Generator

A CLI tool for quickly generating new AURA integrations following best practices.

## Usage

```bash
# Interactive mode
pnpm generate-integration

# With options
pnpm generate-integration --name=slack --category=communication --type=api
```

## Options

- `--name`: Integration name (e.g., `slack`, `github`)
- `--category`: Category name (see categories in `categories/index.ts`)
- `--type`: Integration type (`api`, `database`, `file`, `workflow`, `trigger`)
- `--template`: Template to use (optional)

## Generated Structure

```
packages/plugins/src/categories/{category}/{name}/
├── index.ts                 # Main integration file
├── types.ts                 # TypeScript types
├── actions/                 # Action implementations
│   ├── index.ts
│   └── {action}.ts
├── triggers/                # Trigger implementations (if applicable)
│   ├── index.ts
│   └── {trigger}.ts
├── credentials/             # Credential definitions
│   ├── index.ts
│   └── {credential}.ts
├── utils/                   # Utility functions
│   ├── api-client.ts
│   └── helpers.ts
├── __tests__/               # Tests
│   ├── integration.test.ts
│   └── actions.test.ts
└── README.md                # Integration documentation
```

## Examples

### Generate API Integration

```bash
pnpm generate-integration --name=stripe --category=finance --type=api
```

### Generate Database Integration

```bash
pnpm generate-integration --name=postgresql --category=database --type=database
```

### Generate Workflow Integration

```bash
pnpm generate-integration --name=http-request --category=workflow --type=workflow
```

## Next Steps

After generating an integration:

1. Implement the integration logic
2. Add actions and triggers
3. Define credentials
4. Write tests
5. Document the integration
6. Register in the category index

