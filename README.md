# Battle of the Iron Islands

A simple multiplayer implementation of the classic arcade game, Battleship with a Game of Thrones theme.
The implementation is purely based on NodeJS, SocketIO, Express and HTML(with some CSS Magic).

## Getting Started

Clone this repository using git clone.  
```
$ git clone https://github.com/adityavavre/Battleship.git
```

### Prerequisites

NPM  
NodeJS  
MySQL

### Installing

To Install NPM and NodeJS follow the steps given in the link below

- for Ubuntu :- https://websiteforstudents.com/install-the-latest-node-js-and-nmp-packages-on-ubuntu-16-04-18-04-lts/

- for Windows :- https://blog.teamtreehouse.com/install-node-js-npm-windows

To Install MySQL follow the steps given in the link below

- for Ubuntu :- https://www.digitalocean.com/community/tutorials/how-to-install-the-latest-mysql-on-ubuntu-16-04

- for Windows :- http://www.mysqltutorial.org/install-mysql/

After installing MySQL you need to create a schema called users and a table in it named myusers
myusers is a table containing columns userID(text), pass(text), wins(int), losses(int), rating(int)
You also need to edit the username and password for the MySQL server.

## Instruction to start and play the game

go to the directory and run node app.js
``` 
$ cd cs251project-master
$ npm install
$ node app.js   
```
go to http://localhost:3000 in browser, register and login, find online users and send invitations and enjoy the game.

## Built With

* [Nodejs](https://github.com/nodejs/node) 
* [SocketIo](https://github.com/socketio/socket.io)  
* [Express](https://github.com/expressjs/express)

## Authors

* Arjit Jain
* Aditya Vavre
* Devki Nandan Malav

## Acknowledgments

* https://stackoverflow.com/
* http://dwcares.com/
* https://www.youtube.com/user/thenewboston
