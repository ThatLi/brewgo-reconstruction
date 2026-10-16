# Contributing

## Authorization

Only analyze software that you own or are explicitly authorized to inspect. Contributors are responsible for confirming that their research inputs and methods are lawful in their jurisdiction.

## Clean-room rules

- Commit only independently written source, original assets, synthetic data, and sanitized behavioral specifications.
- Do not commit application packages, binary libraries, decompiled code, raw tool output, extracted resources, signing material, credentials, tokens, or private service endpoints.
- Describe behavior without reproducing third-party implementation text.
- Label product requirements as observed behavior, independent design, or mock-only behavior.
- Keep raw analysis in the workspace-level `work/` directory, outside this repository.

## Commit discipline

- Use Conventional Commit subjects.
- Reference the relevant GitHub issue in every commit body.
- Run the repository safety check and the narrowest relevant tests before committing.
- Review both the working-tree and staged diffs before pushing.
- Do not force-push `main`.

## Verification

Every contribution must pass the checks exposed through `npm test` once the application tooling is introduced. Documentation-only commits must still pass the repository safety check.
