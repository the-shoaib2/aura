# PR Title Convention

We have very precise rules over how Pull Requests (to the `master` branch) must be formatted. This format basically follows the [Angular Commit Message Convention](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit). It leads to easier to read commit history and allows for automated generation of release notes:

A PR title consists of these elements:

```text
<type>(<scope>): <summary>
  │       │          │
  │       │          └─⫸ Summary: In imperative present tense.
  |       |                        Capitalized
  |       |                        No period at the end.
  │       │
  │       └─⫸ Scope: API | core | gateway | workflow | agent | ai | frontend
  │
  └─⫸ Type: build | ci | chore | docs | feat | fix | perf | refactor | test
```

- PR title
  - type
  - scope (_optional_)
  - summary
- PR description
  - body (optional)
  - blank line
  - footer (optional)

The structure looks like this:

## Type

Must be one of the following:

| type | description | appears in changelog |
| --- | --- | --- |
| `feat` | A new feature | ✅ |
| `fix` | A bug fix | ✅ |
| `perf` | A code change that improves performance | ✅ |
| `test` | Adding missing tests or correcting existing tests | ❌ |
| `docs` | Documentation only changes | ❌ |
| `refactor` | A behavior-neutral code change that neither fixes a bug nor adds a feature | ❌ |
| `build` | Changes that affect the build system or external dependencies (TypeScript, Jest, pnpm, etc.) | ❌ |
| `ci` | Changes to CI configuration files and scripts (e.g. Github actions) | ❌ |
| `chore` | Routine tasks, maintenance, and minor updates not covered by other types | ❌ |

> BREAKING CHANGES (see Footer section below), will **always** appear in the changelog unless suffixed with `no-changelog`.

## Scope (optional)

The scope should specify the place of the commit change as long as the commit clearly addresses one of the following supported scopes. (Otherwise, omit the scope!)

- `API` - changes to the _public_ API
- `core` - changes to the core / private API / backend of AURA
- `gateway` - changes to the gateway service
- `workflow` - changes to the workflow engine
- `agent` - changes to the agent service
- `ai` - changes to AI/ML features
- `frontend` - changes to the frontend UI
- `auth` - changes to authentication/authorization
- `db` - changes to database layer

## Summary

The summary contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- capitalize the first letter
- _no_ dot (.) at the end
- do _not_ include Linear ticket IDs etc. (e.g. AURA-1234)
- suffix with "(no-changelog)" for commits / PRs that should not get mentioned in the changelog.

## Body (optional)

Just as in the **summary**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

## Footer (optional)

The footer can contain information about breaking changes and deprecations and is also the place to [reference GitHub issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword), Linear tickets, and other PRs that this commit closes or is related to. For example:

```text
BREAKING CHANGE: <breaking change summary>
<BLANK LINE>
<breaking change description + migration instructions>
<BLANK LINE>
<BLANK LINE>
Fixes #<issue number>
```

or

```text
DEPRECATED: <what is deprecated>
<BLANK LINE>
<deprecation description + recommended update path>
<BLANK LINE>
<BLANK LINE>
Closes #<pr number>
```

A Breaking Change section should start with the phrase "`BREAKING CHANGE:` " followed by a summary of the breaking change, a blank line, and a detailed description of the breaking change that also includes migration instructions.

> 💡 A breaking change can additionally also be marked by adding a "`!`" to the header, right before the "`:`", e.g. `feat(api)!: Remove support for legacy endpoints`
>
> This makes locating breaking changes easier when just skimming through commit messages.

Similarly, a Deprecation section should start with "`DEPRECATED:` " followed by a short description of what is deprecated, a blank line, and a detailed description of the deprecation that also mentions the recommended update path.

### Revert commits

If the commit reverts a previous commit, it should begin with `revert:` , followed by the header of the reverted commit.

The content of the commit message body should contain:

- information about the SHA of the commit being reverted in the following format: `This reverts commit <SHA>`,
- a clear description of the reason for reverting the commit message.

