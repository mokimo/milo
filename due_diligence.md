# [Due Diligence] Improve milo core automation guidance

## Issue
We have two problem in our PR automation system: Stale Label Interference & Notification Spam

The Stale System Runs daily at midnight and labels PRs that did not have any Updates for the past 7 days, and after another 7 days of inactivity closes that PR. There is an interference happening with other workflows that add comments to PRs which then resets the Stale System confusing those comments as an "update" to the PR, which then resets the timer back to 0 and removed the Label from that PR.

Another issue we have is that the PRs are too cramped with all the Notification Spams that is happening from different workflows such as PR Reminders, Test (Unit/Nala), Ready for Stage label, and etc. 

In this Ticket [MWPW-168241](https://jira.corp.adobe.com/browse/MWPW-168241) it was proposed that we implement a Unified Notification System (UNS) which is one big comment in each PR that every workflow writes into instead of creating a new comment, the UNS contains log history of each workflow, failing tests, guidance on why a PR wasn't merged + how to fix failing checks

## Timeline Format Example

## Timeline Format Example
```
### Merge Status
15.03.2024: PR was not merged due to insufficient reviews
16.03.2024: PR was not merged as the merge-to-stage batch is already full
17.03.2024: PR was not merged due to failing tests
19.09.2024: PR merged to stage

### Test Results
15.03.2024: Unit tests failed - please check test/unit/test.js
16.03.2024: Nala tests passed
17.03.2024: All tests passing
```
