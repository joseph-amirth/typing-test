# Preferences
All the ways in which a user can customize their experience on the app are consolidated under the term "preferences".

## Requirements
1. A user that is not signed in may change their preferences and they should not lose these preferences on closing the browser/session.
2. When a user signs up, the preferences they have set should become accessible from any other device through that account.
3. When a user signs in, the preferences they have set prior to signing in should be merged with the preferences they had set while being signed in before.
4. Whenever a user changes their preference, this change should be pushed to all sources of truth for preferences.

## TODOs
Implement requirement #3.

## Onboarding a preference
* In the backend, add the preference as a field to the Preferences struct.
* In the frontend, add the preference to the default preferences constant.

## Current list of preferences
* Typing test mode (one of words, time and quote).
* Language for words mode typing tests.
* Length for words mode typing tests.
* Language for time mode typing tests.
* Duration (in seconds) for time mode typing tests.
* Length bounds for quote mode typing tests.
* Maximum number of characters to be displayed on a line in typing tests.
* Whether all lines of the typing test should be displayed.
