# Races
Users are able to engage in typing races against other users.
To participate in races, users have to select the typing test mode, and they are matched with other users of similar skill.

## Requirements
1. Users should be able to select the exact typing test mode in which they want to race.
2. Users should be matched with players of approximately equal skill in the typing test mode.

## Implementation details
1. Websocket per race?
2. When a user wants to enter a race, they enter the queue at the backend.
3. Once another user is found, the users are moved into the lobby.
4. Once a lobby is created, and no other issues occur, 10 seconds later the race will begin.
5. Until 5 seconds before a race starts, users can be added to a lobby.
