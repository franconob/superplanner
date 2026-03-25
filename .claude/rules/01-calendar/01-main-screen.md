# Main goal of this rule
The goal of this rule is to create the main screen. There's only 2 interactive components here for now:
1. The horizontal list of week days 
2. The vertical list with times of the day
Both list are described below.

## Main screenshots
`./01-main-calendar-view.png`

## Main screen
This is like the home screen. It is a calendar view. At the top you have a navigation bar.

### Navigation bar
- A back arror to go back (will be implemented later)
- A header title. It can show:
    - The day of the day.
    - If you select yesterday's day, it will show "Yesterday"
    - If you select tomorrow's day, it will show "Tomorrow"
    - If you select any future or past day different that yesterday or tomorrow it will show e.g: "March 26th, 2026" 
- An inbox icon (will be implemented later)

### Week days
Then you have an horizontal list of days. You can tap on any day. If it is Saturday or Sunday it will be shown as "grey", otherwise as "white".
When you horizontally scroll to the past or to the feature, the list will be moving one +1 or -1 week.

### List of task
This is a vertical list, with some space between hours. For now, you can only scroll the list to the top (00:00) and to the very bottom (00:00). Any other feature will be implemented later. 
There's a blue line (also the time is blue) that will highlight the current hour.

### Bottom bar
It has three parts:
1. An icon list
2. A title:
    - If you are on today's day, the app doesn't show anything here.
    - If you move to another day, there's a button with a label "Back to today"
3. A plus icon