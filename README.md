## Superplanner clone
This is a clone of the original Superplanner app https://superplanner.app/
There's are a few missing features, but I tried to complete the most important ones.

### How I did it
I used Claude Code with a few skills added and one MCP server. To move faster I enabled Agent Teams feature, still experimental.
It did a very good job tho buy sharing communication and results.

#### Skills used
- reanimated-skia-performance · ~134 description tokens
- vercel-react-best-practices · ~89 description tokens
- vercel-react-native-skills · ~81 description tokens
- research:image-analyze · ~54 description tokens
- building-native-ui · ~43 description tokens
- react-doctor · ~37 description tokens
- react:components · ~34 description tokens

#### MCP servers
- ios-simulator: Connect to the iOS simulator, make Claude interact with the app. This has been very useful, it's like creating e2e tests.
Also, using this MCP, Claude can take screenshots of the app and I created a validation step that compared origin screenshots with the cloned ones
(it doesn't work 100%, pero it does a good job)

### How to run it
- npm i
- npx expo prebuild --clean --platform ios
- npx expo run:ios

#### About the challenge
This has been very challenging for me, I learnt a lot of things (specially Agent Teams). Some things don't work, others are not implemented, I need
more practice with this workflow but is has been awesome! Thanks for this opportunity.