# Routine scope experiment

Branch: `codex/routine-scope-experiment`.

The opt-in script at the end of `fragments/fund-flow-check.html` adds the scope
summary before the existing workspace. Set its `data-enabled` attribute to
`false` to restore the original workflow. The script loads its own scoped CSS;
no original routine calculations or result data are modified.

Arrangements use `run` or `skip`; all routines default to run, without a
confirmation step. Legacy `pending` values migrate to run. Legacy `include`
values migrate to run/skip without losing exclusion reasons.
The current workflow uses a v2 session key so selections from earlier trial
versions cannot override the all-run default on first entry. The old v1 record
is left untouched. Subsequent v2 arrangements still restore normally.
The card title bar includes an all-execute checkbox with an indeterminate
state. Checking sets every routine to run, including filtered-out rows;
unchecking sets every routine to skip. Existing reasons are retained. Bulk
changes clear conflicting decision/reason filters, and skip reasons remain
mandatory before step 2.
Draft and saved arrangements are stored in sessionStorage, separately from
existing routine parameters, keyed by the page project heading. This prototype
does not provide shared backend storage, reviewer sign-off, or change history.

The page opens at step 1 (核查安排). Only the full-height arrangement table and
its Next action are displayed. Step 2 (核查程序) shows the existing left routine
list and right results workspace. The two workspaces are mutually exclusive.
The step navigation permits returning to step 1; entering step 2 via either
Next or its step button saves and applies the arrangement through the same
function. Re-entering without edits does not rewrite the saved timestamp.

Entering step 2 requires a nonblank reason for every skip decision. Next and
direct step navigation share this validation. On failure the page stays at
step 1, clears header filters to reveal invalid rows, marks missing inputs,
and opens a modal with the missing count and first incomplete routine. Closing
the modal via its button or Escape focuses the first missing reason.
Whitespace-only reasons are invalid.
Failed validation never updates the saved scope or its timestamp. There is no separate save, collapse,
batch, cancel, or per-row result action in step 1. It contains four columns:
identifier, procedure, execution choice (是否执行), exclusion reason. Execution results appear
only in step 2. Decision labels never change to completion/execution statuses.

Each data column has a sort control and a filter control. The filters reuse
`openRiskColumnFilter` with a separate `routineScope` UI state, leaving cp/tx
filters untouched. Multiple column filters combine with AND; reset occurs
inside each existing filter popover. Sorting cycles ascending, descending,
and original order, with natural numeric comparison for routine identifiers.

Step 2 retains existing routine navigation and screening controls. Proceeding
from step 1 changes the scope; it does not itself execute a screening procedure.

The module wraps `selectCheck` and `getVisibleCheckGroups` to limit navigation
and displayed routine columns to the saved scope. Export defaults and export
rows use the same scope. The optional `getRiskScopeExportSheet` hook adds a saved
arrangement sheet (including incomplete decisions and reasons) to the existing
workbook. If all routines have been excluded, the workspace empty state offers
a single link to export the saved arrangement. Unsaved edits are never included.
Removing the script tag, the optional workbook hook, and the two experiment
assets removes the feature completely.

Manual checks: initial step 1 and default all-run; Next and direct step 2
navigation; missing/whitespace reason blocks both entry paths; filtered-out
invalid rows are revealed and focused; back to step 1, edit, and proceed again;
no draft-to-results changes before proceeding; header sorting and
combined filters/reset; all-excluded state and return; session reload;
export scope and arrangement sheet; disabled feature flag.
