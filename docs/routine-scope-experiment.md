# Routine scope experiment

Branch: `codex/routine-scope-experiment`.

The opt-in script at the end of `fragments/fund-flow-check.html` adds the scope
summary before the existing workspace. Set its `data-enabled` attribute to
`false` to restore the original workflow. The script loads its own scoped CSS;
no original routine calculations or result data are modified.

Selections and exclusion reasons are stored in sessionStorage, separately from
existing routine parameters, keyed by the page project heading. Unconfirmed
edits do not change the applied workspace. An excluded routine requires a
nonblank reason. All routines can be excluded if every reason is provided.

The module wraps `selectCheck` and `getVisibleCheckGroups` to limit navigation
and displayed routine columns to the applied scope. Removing the script tag
and the two experiment assets removes the feature completely.

Manual checks: initial confirmation; missing reason; all-selected and
all-excluded states; changing scope after confirmation; session reload;
sidebar navigation; counterparty and transaction tables; disabled feature flag.
