const socket = io.connect('ws://10.6.4.221:5500');//connect to server's IP and port

//define html elements for later use
const send_button = document.getElementById('send');
const message = document.getElementById('message');
const logs = document.getElementById('logs');
const userlist = document.getElementById('userlist');

//initial online_users as global
window.online_users = {
	n : 0,
	users : []
};

//When page is loaded send server login event if username is set otherwise popup username picker
window.addEventListener('DOMContentLoaded', (e) => {
	if(!(sessionStorage.getItem('username') && sessionStorage.getItem('avatar'))){
		showPrompt();
	}else{
		socket.emit('login', { user: sessionStorage.getItem('username')});
	}
	updateOnlineUser();
	message.focus();
});

//func return timestamp to use in chat bubbles
getTimestamp = ((time)=>{
	timestamp = time.toDateString().toUpperCase();
	timestamp = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ' | ' + timestamp;
	return timestamp;
});

//show username picker
showPrompt = (()=>{
	overlay = document.querySelector('.overlay');
	overlay.style.zIndex = "5";
	overlay.style.opacity = "1";
});

//close username picker
closePrompt = (()=>{
	overlay = document.querySelector('.overlay');
	overlay.style.zIndex = "-5";
	overlay.style.opacity = "0";
	//store username and avartar to sessionStorage
	sessionStorage.setItem('username', document.querySelector('.prompt #username').value);
	sessionStorage.setItem('avatar', document.querySelector('.prompt .avatar.list .avatar.selected').dataset.no);
});

//update online-user list
updateOnlineUser = (()=>{
	userlist.innerHTML = "";
	window.online_users.users.forEach((user)=>{
		li = document.createElement("li");
		li.innerHTML = user.username;
		userlist.appendChild(li);
	});
});

//handle avatar selection
let avatars = document.querySelectorAll('.prompt .avatar.list .avatar');
avatars.forEach(avatar => {
	avatar.addEventListener('click', (event)=>{
		let selected = document.querySelector('.prompt .avatar.list .avatar.selected');
		selected.classList.remove('selected');
		let tar = event.target.parentNode;
		tar.classList.add('selected');
	});
});

//run when ok_button is clicked to close username picker and emit 'login' to server
const ok_button = document.querySelector('.overlay .prompt .ok.button');
ok_button.addEventListener('click', ()=>{
	closePrompt();
	socket.emit('login', { user: sessionStorage.getItem('username')});
});

//handle enter key in messsage input
message.addEventListener('keyup', (event)=>{
	if (event.keyCode === 13){
		event.preventDefault();
		send_button.click();
	}
});

//emit 'chat' to server with message and user info
send_button.addEventListener('click', ()=>{
	socket.emit('chat',{
		message: message.value,
		user: sessionStorage.getItem('username'),
		avatar: sessionStorage.getItem('avatar')
	});
	message.value = "";
});

//handle message when receive 'chat' from server
socket.on('chat', (data)=>{
	let time = new Date(data.time);
	let template = document.querySelector('#chat_item');
	let item = document.importNode(template.content, true);
	item.querySelector('.avatar img').setAttribute('src', 'img/'+data.avatar+'.png');
	item.querySelector('.avatar img').setAttribute('alt', data.user);
	item.querySelector('h5.name').innerHTML = data.user;
	item.querySelector('.timestamp').innerHTML = getTimestamp(time);
	item.querySelector('.body').innerHTML = data.message;
	logs.appendChild(item);
	logs.parentNode.scrollTop = logs.parentNode.scrollHeight;
});

//update online_users when receive 'newuser' event
socket.on('newuser', (data)=>{
	window.online_users.n = data.n;
	window.online_users.users = data.users;
	updateOnlineUser();
});