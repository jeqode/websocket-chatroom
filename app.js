const express = require('express');
const app = express();
const port = 5500;
app.use(express.static('public'));
const server = app.listen(port, ()=>{
	console.log('Listening on localhost:'+port);
});
const socket = require("socket.io");
const io = socket(server);
const now = new Date();
var online_users = {
	n : 0,
	users : []
};

io.on('connection', function(socket){
	console.log(socket.id);
	socket.on('login', (data)=>{
		user = {
			id : socket.id,
			username : data.user
		};
		if(online_users == undefined){
			online_users.n = 1;
			online_users.users = [user];
		}else{
			online_users.n += 1;
			online_users.users.push(user);
		}
		console.log(online_users);
		io.emit('newuser', online_users);
	});
	socket.on('chat', (data)=>{
		data.time = now.getTime();
		io.sockets.emit('chat', data);
	});
	socket.on('disconnect', ()=>{
		let user = online_users.users.find((user)=>{return user.id == socket.id;});
		if(user != undefined){
			online_users.users = online_users.users.filter((user)=>{
				return user.id !== socket.id;
			});
			online_users.n -= 1;
		}
	});
});

