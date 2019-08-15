const socket = io.connect('http://10.6.4.221:5500');
const send_button = document.getElementById('send');
const message = document.getElementById('message');
const logs = document.getElementById('logs');
const userlist = document.getElementById('userlist');
logs.parentNode.scrollTop = logs.parentNode.scrollHeight;
window.online_users = {
	n : 0,
	users : []
};

window.addEventListener('DOMContentLoaded', (e) => {
	if(!(sessionStorage.getItem('username') && sessionStorage.getItem('avatar'))){
		showPrompt();
	}else{
		socket.emit('login', { user: sessionStorage.getItem('username')});
	}
	updateOnlineUser();
});

getTimestamp = ((time)=>{
	timestamp = time.toDateString().toUpperCase();
	timestamp = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ' | ' + timestamp;
	return timestamp;
});

showPrompt = (()=>{
	overlay = document.querySelector('.overlay');
	overlay.style.zIndex = "5";
	overlay.style.opacity = "1";
});

closePrompt = (()=>{
	overlay = document.querySelector('.overlay');
	overlay.style.zIndex = "-5";
	overlay.style.opacity = "0";
	sessionStorage.setItem('username', document.querySelector('.prompt #username').value);
	sessionStorage.setItem('avatar', document.querySelector('.prompt .avatar.list .avatar.selected').dataset.no);
});

updateOnlineUser = (()=>{
	userlist.innerHTML = "";
	window.online_users.users.forEach((user)=>{
		li = document.createElement("li");
		li.innerHTML = user.username;
		userlist.appendChild(li);
	});
});

let avatars = document.querySelectorAll('.prompt .avatar.list .avatar');
avatars.forEach(avatar => {
	avatar.addEventListener('click', (event)=>{
		let selected = document.querySelector('.prompt .avatar.list .avatar.selected');
		selected.classList.remove('selected');
		tar = event.target.parentNode;
		tar.classList.add('selected');
	});
});

const ok_button = document.querySelector('.overlay .prompt .ok.button');
ok_button.addEventListener('click', ()=>{
	closePrompt();
	socket.emit('login', { user: sessionStorage.getItem('username')});
});

message.focus();
message.addEventListener('keyup', (event)=>{
	if (event.keyCode === 13){
		event.preventDefault();
		send_button.click();
	}
});

send_button.addEventListener('click', ()=>{
	socket.emit('chat',{
		message: message.value,
		user: sessionStorage.getItem('username'),
		avatar: sessionStorage.getItem('avatar')
	});
	message.value = "";
});

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

socket.on('newuser', (data)=>{
	window.online_users.n = data.n;
	window.online_users.users = data.users;
	updateOnlineUser();
});