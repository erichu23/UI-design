# Special transaction viewing experiment

Branch: `codex/routine-scope-experiment`.

The opt-in script at the end of `fragments/fund-flow-check.html` adds two steps:
识别结果 and 识别概览. Set `data-enabled="false"` to restore the original workflow
on reload. Its CSS, sidebar checkboxes and metadata adaptations are scoped to
the opt-in module. There is no backend execution control in the viewing UI.

## Shared Standards

`assets/js/config/routine-standards.js` is the common procedure/criteria catalog
for this experiment and the working-paper export page. It contains the 24
standards already present in that working paper. The experiment removes the
extra 4.5-4.9 entries from navigation, result columns and export choices.
The special-transaction page additionally excludes 5.1/5.2 and the now-empty
其他异常 group, leaving 22 supported items. Working-paper tables follow the same
22-item demo result set; the legacy catalog definitions themselves are retained.
Procedures use the complete working-paper text, not sidebar abbreviations.
The wording is aligned to the supplied reference screenshots and the user's
complete 2.1.3 sentence. Shared descriptions also feed the legacy embedded
working-paper renderer. Updating descriptions never rewrites saved thresholds.

The working paper defines 4.3 as natural persons and 4.4 as individual businesses
or sole proprietorships. Do not carry the old registered-capital hit into 4.4.
The experiment uses `routine-demo-data.js` for a deterministic fixture of 144
counterparties and 1,653 transactions in 2024/2025. All 22 supported routines have
matching examples under the default conditions, with normal records as controls.
Counterparty totals and hit lists are derived from transaction records; settings,
both result tables and working-paper tables share these aggregates. User criteria
are evaluated against the fixture, so restrictive filters may legitimately yield
zero. Manual exclusions and restores never change the underlying transactions.

Default amount thresholds are CNY 50,000 for single transactions, personal
accounts, year-end transactions, non-customer/supplier transactions and reversed
customer/supplier flows; CNY 1,000,000 for annual inflow/outflow; and CNY 100,000
for overlapping receipts/payments and infrequent counterparties. These are demo
defaults, not an audit conclusion. Saved custom amounts are retained. Legacy
empty amounts receive defaults once; subsequent intentional blanks are preserved
using the parameter snapshot's `amountDefaultsVersion` marker. A versioned result
snapshot keeps the export tables aligned without replacing backend field names.

Criteria formatting uses current routine parameters when available and the
working-paper criterion otherwise. Both pages use the same formatter, including
zero values and empty/unrestricted parameters. Editable working-paper criteria,
viewing settings and result filters use `RoutineDemoData.readParameters` /
`saveParameters`. A storage notification synchronizes open documents and frames;
a same-document event refreshes working-paper tables immediately. Changes
re-evaluate the same transaction fixture, preserve manual exclusions, and refresh
the shared result snapshot. Invalid dates, negative amounts, percentages above
100 and reversed transaction-count ranges cannot be saved.

## Viewing State

Only routines 1.1, 3.6, 3.7, 4.1 and 4.2 show a 分布参考 button immediately after
the result-header filters. Its read-only table opens in a nonmodal popover and
the same five rows in 识别概览 have matching buttons after their condition fields.
Overview buttons use the row's ID without changing the active result routine.
Both locations share statistics, units, icons and one anchored popover. Its table
never consumes result-table layout height. Clicking outside, Escape, changing
routine or opening the overview closes it. Escape restores focus to its trigger.
The viewport-clamped popover fits narrow screens without horizontal scrolling.
It opts out of automatic text-unit parsing to preserve fixed M range labels.
Amounts follow the shared unit. Statistics are calculated before the routine's
threshold, within the current result-table scope, excluding manual removals.
For 1.1 the metric is a single corporate transaction; 3.6 uses counterparty
total transaction amount; 3.7 uses min(inflow,outflow)/max(inflow,outflow).
The 3.7 thresholds are cumulative, so their amounts and shares are not additive.
The range display never edits parameters, filters rows or modifies recognition.

Internal legacy `run`/`skip` decision values mean view/hide, never execute/skip.
Every standard is checked by default on first entry. The v3 session key is
separate from the older execution-arrangement experiment; old skipped execution
choices do not silently become new viewing preferences. Current v3 sessions
restore normally. Draft and saved preferences are kept separately.

Step 1 opens the results immediately. Step 2 contains identifier, full procedure
and criteria, without 是否查看 / 不查看原因 columns.
The three result columns after criteria are 识别对手方数, 识别交易总额 and
识别交易笔数, right-aligned with the page's amount unit (no separate unit caption).
The settings table fits the available width with percentage-based columns;
procedure text wraps in settings, while results/sidebar titles retain ellipsis.
The settings grid has
matching vertical separators in its sticky header and body.
Counterparty mode counts the retained matching counterparty records and their
retained matching transaction rows; transaction mode uses the currently filtered
transaction rows and distinct counterparty IDs. Amounts are summed from those
transaction records in integer cents before formatting, never from demo badges
or estimated transaction counts. Returning to settings, changing conditions,
or exporting settings refreshes the results. Hover text identifies the scope.
The settings export includes these result fields. Settings headers are labels
only, with no sort/filter controls; rows keep their natural routine-ID order.
Parameterized criteria are editable inline using the existing routine metadata.
Changes persist to the shared parameter snapshot and synchronize the results
editor, sidebar criteria and working-paper export. Rules without configurable
parameters retain their static text. Invalid numeric/date values block returning
to the results. No separate
card-title bar, bulk-view control or saved-status text is displayed. Viewed and
not-viewed counts appear at the bottom left; 返回识别结果 remains at the
bottom right. Validation/storage errors appear only when needed.
Sorting/filtering in the result tables remains unchanged.

The results sidebar header contains two compact tabs, 正在查看 and 已隐藏,
with counts. There is no separate 识别项目 title or duplicated total. The normal
list is fully expanded, without the legacy category/核查标准 fold controls.
Unchecking an item opens 隐藏此识别项目 with a required reason. Cancel or Escape
restores the checkbox without changing saved state; confirmation removes the
item from the normal list and saves its reason. A timed 撤销 action restores the
last hidden item. The 已隐藏 section shows each hidden procedure, its reason
and 恢复查看; restoring switches to 正在查看 and selects that item in the results.
An unobtrusive 全部恢复查看 command restores hidden items in one saved update.
The viewing controls remain real multi-select checkboxes with compact 14px
circles, hover titles and keyboard focus indicators, not radio buttons.
Reasons remain in the session and export record. Incomplete legacy drafts are
discarded, while valid applied viewing preferences are retained. The former
显示核查标准 checkbox strip is removed.

If the active item is hidden, another viewed item becomes active. If none remain,
the right result area gives an empty state. The sidebar remains available and
automatically selects 已隐藏, allowing recovery even when all items are hidden.
Individual result filters for newly hidden standards are cleared so
invisible filters do not constrain the remaining rows.

Selecting a routine puts its currently checked hits first in both result tables,
before pagination, without hiding other results. Remaining rows are ordered by
retained hit count descending, with the existing column sort as the tie-breaker.
Existing column sorting is retained within the active-hit partition.
Manually cleared hits are treated as non-hits, using the same helper
as the table checkmarks. Routine switches reset both tables to page 1. The same
order is used by filtered-row helpers and enlarged table views.

The mark-status column summarizes all viewed routines for the row, not only the
currently selected routine or independent legacy row-status flags. It shows
已命中 N when no hit has been removed, 部分排除 R/T when some have been removed,
or 已排除 T/T when all hits have been removed. T is the original hit count in
the viewed routines, R the removed count, and N the retained count. Only a hit
actually present on that row can be counted as removed; a counterparty-wide
removal does not create a hit on unrelated transaction rows. Rows with no hits
use a dash. Filters, sorting and exports use the same result. 部分排除 refers
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
