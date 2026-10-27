# Special transaction viewing experiment

Branch: `codex/routine-scope-experiment`.

The opt-in script at the end of `fragments/fund-flow-check.html` adds two steps:
查看设置 and 识别结果. Set `data-enabled="false"` to restore the original workflow
on reload. Its CSS, sidebar checkboxes and metadata adaptations are scoped to
the opt-in module. There is no backend execution control in the viewing UI.

## Shared Standards

`assets/js/config/routine-standards.js` is the common procedure/criteria catalog
for this experiment and the working-paper export page. It contains the 24
standards already present in that working paper. The experiment removes the
extra 4.5-4.9 entries from navigation, result columns and export choices.
The special-transaction page additionally excludes 5.1/5.2 and the now-empty
其他异常 group, leaving 22 supported items. This display-specific exclusion does
not delete those definitions from the independent working-paper export catalog.
Procedures use the complete working-paper text, not sidebar abbreviations.
The wording is aligned to the supplied reference screenshots and the user's
complete 2.1.3 sentence. Shared descriptions also feed the legacy embedded
working-paper renderer. Updating descriptions never rewrites saved thresholds.

The working paper defines 4.3 as natural persons and 4.4 as individual businesses
or sole proprietorships. Do not carry the old registered-capital hit into 4.4.
The experiment aligns these two sample-data hit mappings with the entity-type
field. Other detection calculations are unchanged. Existing prototype result
statuses and missing-master dependencies are not fabricated as completed.

Criteria formatting uses current routine parameters when available and the
working-paper criterion otherwise. Both pages use the same formatter, including
zero values and empty/unrestricted parameters. The export page remains read-only.

## Viewing State

Internal legacy `run`/`skip` decision values mean view/hide, never execute/skip.
Every standard is checked by default on first entry. The v3 session key is
separate from the older execution-arrangement experiment; old skipped execution
choices do not silently become new viewing preferences. Current v3 sessions
restore normally. Draft and saved preferences are kept separately.

Step 1 contains identifier, full procedure, criteria, 是否查看 and 不查看原因.
Parameterized criteria are editable inline using the existing routine metadata.
Changes persist to the shared parameter snapshot and synchronize the results
editor, sidebar criteria and working-paper export. Rules without configurable
parameters retain their static text. Invalid numeric/date values block Next.
Reasons are disabled while checked and enabled when unchecked. No separate
card-title bar, bulk-view control or saved-status text is displayed. Viewed and
not-viewed counts appear at the bottom left; the Next button remains at the
bottom right. Validation/storage errors appear only when needed.
Column sorting/filtering reuses existing popovers with isolated state.

Entering step 2, by Next or the step button, requires a nonblank reason for every
unchecked standard. Missing/whitespace-only reasons open a modal, reveal filtered
invalid rows and focus the first missing reason when dismissed. Invalid drafts
never replace saved preferences. Returning to step 1 permits restoring any item.

Step 2 retains all supported standards in the sidebar. Unchecked items and their
checkboxes are disabled and grey; they cannot be selected and have no result
columns. Selected items have a checkbox before the procedure text. Unchecking
one opens a required-reason dialog. Cancel or Escape restores its checkbox;
confirm synchronizes step 1, the sidebar, visible columns and the saved session.
Hidden items can be restored in step 1. The former 显示核查标准 checkbox strip is
removed; result groups derive from the saved viewing choices instead.

If the active item is hidden, another viewed item becomes active. If none remain,
the results workspace gives an empty state, with the step navigation still
available. Individual result filters for newly hidden standards are cleared so
invisible filters do not constrain the remaining rows.

Selecting a routine puts its currently checked hits first in both result tables,
before pagination. Existing column sorting is retained within the hit/non-hit
partitions. Manually cleared hits are treated as non-hits, using the same helper
as the table checkmarks. Routine switches reset both tables to page 1. The same
order is used by filtered-row helpers and enlarged table views.

The mark-status column summarizes all viewed routines for the row, not only the
currently selected routine or independent legacy row-status flags. It shows
已命中 when any checked hit remains without a manual removal, or 部分排除 when
any displayed mark has been removed. Rows with no hits use a dash, not a third
named status. Filters, sorting and exports use the same result. 部分排除 refers
only to manual mark-clear records; it is not an audit conclusion that a record
is safe. Changing the active routine does not change the row's aggregate state.
Both the existing routine checkmark cells and the 已命中/部分排除 status buttons
open the same reason/restore dialogs. Empty or whitespace-only reasons do not
clear marks or dismiss the dialog. Transaction cells resolve hits from their
own flags, not only from the counterparty's hit list. Notes are retained.

Viewing preferences do not suppress automatic recognition or independent export
choices. Export still permits all supported standards, including those not viewed
on screen. The optional `getRiskScopeExportSheet` hook adds a 查看设置 sheet with
saved choices, criteria and reasons. Unsaved edits are never exported as saved.

## Count Consistency

All counts derive from the same raw hit IDs and manual-clear records. The row's
命中个数 counts retained checkmarks in viewed routines only, including collapsed
group summaries; removed and hidden marks do not contribute. Header filters,
sorting and exported hit counts use the same convention. Export counts refer to
the standards selected for that export and equal the sum of its check columns.

Sidebar badges and the active routine's top badge count retained matching rows
in the active table's current filtered result across every page. Counterparty
mode counts counterparty records; transaction mode counts transaction records.
Badge tooltips identify the basis and removal count. Changing tabs, result
filters, visibility or manual clear/restore recomputes the badges. No hardcoded
demonstration counts are reused. Grey, unviewed routines still show their
available count in this filtered result, but do not contribute to row totals
or aggregate status in the current table.

## Verification

Check default all-selected, reason activation, both step-entry validation paths,
sidebar grey/disabled state, result-column exclusion, sidebar reason-dialog
cancel/confirm, restoring choices, all-hidden state, session reload, independent
export choices, procedure/criteria agreement with the working paper, and the
disabled experiment flag. No new runtime dependency is required by the feature.
