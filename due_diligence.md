# [Due Diligence] Improve milo core automation guidance

## Current Issue

We have two problems in our PR automation system:

1. **Stale Label Interference**
   - The stale label system is being reset by automated workflow comments
   - This happens because any comment (even from workflows) is considered an "update"
   - As a result, PRs that should be marked as stale aren't being properly tracked

2. **Notification Spam**
   - Multiple workflows post separate notifications on PRs
   - This creates noise and makes it hard to track PR status
   - We need a cleaner, timeline-based notification system

## Current Workflow Analysis

### Stale PR System
- Runs daily at midnight
- Marks PRs as stale after 7 days of inactivity
- Closes PRs after 14 days (7 days stale + 7 days before close)
- Exempts PRs with "Ready for Stage" label
- Current message: "This PR has not been updated recently and will be closed in 7 days..."

### Workflows That Post Comments (Interfering with Stale)

1. **PR Reminders (pr-reminders.js)**
   - Runs daily at midnight
   - Posts comments for:
     - Failing checks: "This pull request is not passing all required checks..."
     - Needs verification: "This PR is currently in the `needs-verification` state..."
     - Ready for stage reminder: "Reminder to set the `Ready for Stage` label..."

2. **Merge to Stage (merge-to-stage.js)**
   - Posts comments for:
     - Failed merges: "Skipped merging {number}: {title} due to failing or running checks"
     - Insufficient approvals: "Skipped merging {number}: {title} due to insufficient approvals"
     - Merge errors: "Error merging {number}: {title} {error.message}"

3. **Test Workflows**
   - Run Tests (run-tests.yaml): Posts test results and failures
   - Run Lint (run-lint.yaml): Posts linting results
   - Nala Tests (run-nala.yml): Posts Nala test results

4. **PR Merge Notifications**
   - Posts Slack notifications when PRs are merged
   - Creates comments for stage-to-main PRs

### Comment Patterns
1. **Status Updates**
   - Check failures
   - Test results
   - Lint results
   - Merge status

2. **Reminders**
   - Ready for Stage label
   - Needs verification
   - Failed checks

3. **Error Messages**
   - Merge failures
   - Test failures
   - Check failures

## Contributor Guidance Scenarios

### Test Failure Scenarios
1. **Nala Test Timeouts**
   - **Problem**: Tests failing due to timeouts in MAS and review tests
   - **Root Cause**: Tests might be failing due to being out of sync with stage
   - **Solution**: 
     - Rebase with stage before pushing feature branch
     - This helps keep things up-to-date
     - Mitigates conflicts early
     - Avoids unnecessary test failures

2. **Local Testing**
   - **Problem**: Whole test suite takes too long to run locally
   - **Impact**: Developers can't easily verify tests before pushing
   - **Current Workaround**: Rely on CI/CD pipeline for test verification
   - **Potential Improvement**: Optimize test suite for local development

### Best Practices for Contributors
1. **Branch Management**
   - Always rebase with stage before pushing feature branch
   - Keep feature branches up-to-date with stage
   - Resolve conflicts early in the development process

2. **Test Verification**
   - Run relevant subset of tests locally when possible
   - Be aware of test timeouts and their causes
   - Understand when test failures are related to branch state vs actual code issues

## Proposed Solution

### Unified Notification System
We should create a single "milo-core" notification system that:
1. Maintains one thread per PR
2. Uses a timeline format to show PR history
3. Updates existing comments instead of creating new ones
4. Categorizes notifications into clear sections

### Workflow Simplification
The UNS has the potential to make several current workflows redundant:

1. **PR Reminders Workflow**
   - Current: Posts separate comments for failing checks, verification needs, etc.
   - New Approach: 
     - Replace with UNS timeline entries
     - Include clear guidance on how to fix issues
     - Show historical context of why PR wasn't merged
     - Eliminate need for separate reminder workflow

2. **Test and Check Notifications**
   - Current: Multiple workflows post separate notifications
   - New Approach:
     - Consolidate into UNS timeline
     - Provide clear resolution steps
     - Show progression of fixes

3. **Merge Status Updates**
   - Current: Separate notifications for merge attempts and failures
   - New Approach:
     - Single timeline entry with merge status
     - Clear reasons for merge failures
     - Actionable next steps

### Benefits of Simplification
1. **Reduced Complexity**
   - Fewer workflows to maintain
   - Clearer notification patterns
   - Less interference with stale workflow

2. **Better Developer Experience**
   - Single source of truth for PR status
   - Clear historical context
   - Actionable guidance for fixes

3. **Improved Automation**
   - More reliable stale label system
   - Cleaner notification history
   - Better tracking of PR lifecycle

### Timeline Format Example
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

### Stale Label Protection
To fix the stale label interference, we should:
1. Implement a comment classification system to mark workflow comments
2. Modify the stale workflow to ignore classified comments
3. Use GitHub's bot comment features where possible
4. Consider using comment metadata to identify workflow-generated comments

## Next Steps
1. Create a proof of concept for comment classification
2. Modify the stale workflow to respect comment classification
3. Implement the unified notification system
4. Migrate existing workflows to use the new system

## Action Items
1. [ ] Design comment classification system
2. [ ] Modify stale workflow to ignore classified comments
3. [ ] Create unified notification system
4. [ ] Plan migration of existing workflows
