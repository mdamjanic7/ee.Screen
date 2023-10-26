This script will take screenshots of all Square Online themes in all locales for both desktop and mobile devices.


# Get started
0. Make sure latest node is installed on your computer
1. Clone or download this project
2. Run `npm install`
3. Configure the `settings.json` to whatever you'd like
4. Start the process by running `npm index.js`
5. Screenshots will start appearing in the `screenshots` folder

# Gotchas 
* Sometimes websites won't load in the alloted time, resulting in a white screenshots. Re-running the script with only the relevant theme names and locales usually fixes the issue. 
* Adding the `?location=xxx`` parameter to a theme that uses Order Online page as home will prevent the location selection modal from appearing in the screenshot.