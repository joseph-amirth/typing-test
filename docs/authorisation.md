# Authorisation
A user is able to create an account for themselves and authorise themselves with their username/email and their password. When a user is signed in, their activity is stored in association with their account.

## Requirements
1. Users should be able to create accounts for themselves by supplying a valid username and password. They must also supply their email and a code that is sent to the email to verify that they are human.
2. Users should be able to sign in to their accounts by supplying their username/email and their password.
3. Users should be able to sign in to their accounts by supplying their email only and requesting a sign-in link to be sent to their email.
4. Users should be able to change their password by supplying their username/email and accessing a link sent to their email for the same.
5. Users should be able to log out with the simple click of a button.
6. Users should also be able to sign up with their google accounts and subsequently sign in with the same.
7. Once a user is signed in to a browser, their sign-in information should be preserved so as to eliminate the necessity for the user to re-authorise themselves every time.
8. Users' sign-in information saved to a browser should expire after some duration of inactivity (say 10 days) on the same browser.

## TODOs
* Implement requirement #1 to verify that the user is human.
* Implement requirements #3, #4, #6, #8.
