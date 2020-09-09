# Setup
1. Create a slack app at https://api.slack.com/
2. Add the bot and create an oauth token
3. Copy `example.env` to `.env`
4. Update `SLACK_TOKEN` with your new slack token
5. Update the `PG` fields with your postgres information
7. Run npm install and npm start to begin development

# Building and running on a server
1. Run `npm run build`
2. Copy `ts-built`, `package.json`, `package-lock.json`, and `node_modules` to the destination
3. Configure the environment on the destination
4. Run `npm run runBuild`