# GraphRTC

test

## How does it work?

User 1 create a room.  
He then subscribe to the room new participants.

User 2 join a room by sending a generated key (uuid by the client).  
* This key is use to identify the user.  
* He the subscribe to the offers and answers.

When the user 1 get the user 2 uuid, he send an offer to this user via websocket

When the user 2 get an offer from user 1, he send an answer to this user
