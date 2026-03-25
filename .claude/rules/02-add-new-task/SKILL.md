# Main goal of this rule

This rule describes the "Add new task" screen. This screen is actually a modal that appears from bottom to top, covering the entire screen but not the status bar.
By tapping the "Activities row" it will open a small bottom sheet. Check `./activity-list.png`. This component animates from the bottom of the screen
By tapping "List" it will open a similar bottom sheet. Check `./list.png`
By Tapping "Parent task", it will open a full screen modal. Check `./select-parent-task-modal.png`
By tapping the three dots in the header of the form, the floating window appears with 3 options. Check `./floating-window.png`

Once the task is saved, on the calendar screen, it inbox icon must display how many tasks are created for the current day (must display a number to the left of the inbox icon)

## Screenshots

02-add-new-task.png: Main screen, folow exactly what you see in the image
add-task-form.mov: Check animations

## References

Check @rules/common/components/floating-menu. This floating menu must be implemented when you tap the three dots button
