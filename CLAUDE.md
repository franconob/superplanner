## About the project

The goal of this project is to clone an existing app. The cloned app must look exactly the same as the original one.
Useful links:

- https://superplanner.app/
- https://superplanner.app/press-kit
- https://apps.apple.com/us/app/superplanner-daily-planner/id6443725564

Superplanner is a day planner and task manager (similar to Google Calendar) but with more features. It visually looks really great.
We only need to focus on the mobile implementation. In this folder you will find a just created Expo project using SDK 55. You will start adding new fetaures here. You will use already installed skills (react best practices, react navive best practices, etc...)

## Goals

The cloned app must look very very similar to the original one. It must support all the features (not the premium ones). Since there's no backend server, the app will us a in-app database to save and retrieve data. You will work by looking at screenshots at `./screenshots` folder for each screen.

## Architecture

- Stack: Expo (SDK 55), Expo SQLite to store sutrctural db, local notifications
- Support light and dark themes
- Support only iOS devices
- Use react native reanimated. This app have several small but beatiful animations, let's pay attention to them, I'll provide some GIFs to you. PAY A LOT OF ATTENTION TO ANIMATIONS. I will provide some videos, you need to check them very careful
- Use react-hook form for form handling. Also use Zod as validation library

## Do's

- Make always a plan before executing any commands or do any modification
- You can right md files in `./claude` to keep track of the entire plan
- If you are not sure what to use, how to do it or you need more information about something, ask me
- Each new feature (new screen or similar) must have its own plan, you can write a md file to keep track of you are doing
- Encapsulate business login un custom hooks. Use clean architecture as folder structure (folder structure by feature, not by screens/components)
- Do not hardcode colors, create a color pallete and reference them

## Dont's

- Do not do something you are not sure
- Do not install libraries before asking me, I need to check what you are doing

## Team

Create an agent team to clone and test the app.
One teammate is an expert on building professional UI interfaces using Expo. This teammate will also check the `/.screenshots` folder to create beautiful UIs. This teammate is also an expert on using react native reanimated and creates animations at 60fps.
The second teammate is a react native senior developer how can integrate the UI with business logic, create the in-app db and connect it to the React components. This teammate will also check the `./screenshots` folder to know how the app interacts with the user. This folder contains screenshots of every screen and how navigation works.
The third teammate is an export doing research. It will go to the official website of Superplanner, look at screenshots and check the press-kit and will design some guidelines on how to build the app.

As a first step, the researcher will look into the website, check the screenshots and prepare a document with color palletsand design guidelines

### Specific rules for every screen

See `./claude/rules` for instructions on specific screens. Each rule is for a specific screen or feature. It has numbered folders and inside each folder 1 or more md files with instructions and 1 or more screenhots.

### Validation process

There's an mcp installed to start an ios simulator, open the app and take screenshots of what you did. I want to do this to compare what you did vs what must be done. This MCP is called "ios-simulator". How to use it:

- Use this MCP fi you need to verify something visual. DO NOT start this process if fixing something it's not visual!
- Launch the Expo GO app
- Take a screenshot of the screen we are developing at the moment.
- Compare that screenshot you took with the provided screenshots under .claude/rules/\* folders
- Take notes of how it should finally look (screenshots in .claude/rules/\* are the original ones, our implementation must look as close as possible)
