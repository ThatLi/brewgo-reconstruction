# Sanitized artifact inventory

`schemas/artifact-inventory.schema.json` defines the only Android target summary permitted in Git.

## Permitted information

- Package identifier and version metadata
- Minimum and target SDK values
- Declared component and permission names
- Artifact roles, sizes, and SHA-256 digests
- Technology-family conclusions and concise indicators
- Coverage states and unresolved questions
- Evidence references containing artifact digests and selectors

## Excluded information

- Absolute or user-specific filesystem paths
- Raw manifests, resources, bytecode, native libraries, or decompiled text
- Extracted artwork, copy, fonts, or other proprietary assets
- Credentials, tokens, production endpoints, request payloads, and signing material
- Claims about runtime or backend behavior not established by the static evidence

Signature verification remains explicitly `false`; static package inspection does not establish trust in the signer. Missing values use `null`, and incomplete analysis is represented through coverage states and `unknowns` instead of guesses.

The artifact-set digest must be derived deterministically from the ordered member SHA-256 values. The eventual projection script validates this schema before a sanitized inventory is committed.
