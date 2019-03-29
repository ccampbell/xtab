**PLEASE NOTE** Version 1.0.0 and later of this extension will no longer be open source and will be developed in private. The version 0.3.0 code here will remain licensed under the MIT license, and this repo will still be used to track issues and feature suggestions.

# xTab

<img width="175" height="96" src="https://user-images.githubusercontent.com/259316/55256280-11fb4380-5233-11e9-88e8-800475180e93.png" />

Chrome extension for limiting the total number of tabs you can have open at the same time.

## Install it here:

https://chrome.google.com/webstore/detail/xtab/amddgdnlkmohapieeekfknakgdnpbleb

### What’s new in version 1.0.0

- Rearchitected to support additional functionality and custom builds.
- Updated the pop up UI to make it simpler to understand what the different options do
- Added an option to prevent tabs that are playing audio from being closed by the extension (enabled by default)
- Added an option to recycle existing tabs. This means that instead of closing an old tab it will reuse the old tab and move it into the new position. This allows you to use the back button to get back to a tab that has been closed (disabled by default)
- Added a page that shows up in place of a new tab if you have the extension set to block new tabs from opening (enabled by default)
- Added an option to block tabs from opening without showing a page (disabled by default)
- Added new xTab logo to popup menu
- Updated extension icon 
- Updated extension logo
- Improved handling of tabs you have never been to
- Decreased amount of time until a tab is considered active to prevent cases where sometimes a tab doesn’t get closed even though you have been to it 
- Reduced number of options in tab limit dropdown
