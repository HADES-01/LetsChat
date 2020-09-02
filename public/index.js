const socket = io();
let message_list = document.getElementById("message-list"),
    nickname = document.getElementById('nickname'),
    message = document.getElementById('message').value,
    message_input = document.getElementById('message'),
    username = nickname.value,
    user_list = document.getElementById('user-list');

let newUser;

const newMessage = (content, color) => {
    const message = document.createElement('li');
    message.innerHTML = content;
    message.style.borderLeft = `5px solid ${color}`;
    message.style.margin = 'auto';
    message.classList.add("list-group-item", "w-50", "mt-2", "ml-2", "px-2", "py-0");
    return message;
}

const sendMessage = (content, color) => {
    const message = document.createElement('li');
    message.innerHTML = content;
    message.style.borderRight = `5px solid ${color}`;
    message.style.marginRight = "-45%";
    message.classList.add("list-group-item", "w-50", "mt-2", "ml-2", "px-2", "py-0");
    return message;
}

const newUserItem = (data) => {
    const user = document.createElement('li');
    user.classList.add("list-group-item");
    user.id = data.username;
    user.innerHTML = data.username;
    user.style.color = data.color;
    return user;
};

const messagePopup = (content, color) => {
    const message = document.createElement('li');
    message.innerHTML = content;
    message.classList.add("msg", "w-25", "mt-2", "ml-2", "p-2", "shadow-lg", "bg-white", "rounded");
    message.style.background = 'rgb(247,243,218)';
    message.classList.add("py-0");
    return message;
}

const isTypingMsg = (user) => {
    const message = document.getElementById('isTyping');
    message.style.display = 'block';
    message.innerHTML = "<strong class='user-name' style=\'color:" + user.color + "\'>" + user.username + "</strong> <br>" +
        " <span id='dot'><i class=\'fas fa-circle\'></i> </span><span id='dot'><i class=\'fas fa-circle\'> </i></span><span id='dot'><i class=\'fas fa-circle\'> </i></span>";
    message.style.borderLeft = `5px solid ${user.color}`;
    message.classList.add("msg", "w-25", "mt-2", "ml-2", "p-2", "shadow-lg", "bg-white", "rounded","py-0");
    message.style.background = 'rgb(247,243,218)';
    return message;
}

const isNotTypingMsg = (user) => {
    const p = document.getElementById('isTyping');
    p.style.display = 'none';
}

// nickname.onkeydown = nickname_input;
nickname.onfocus = nickname_input;

function nickname_input(){
    nickname.onkeydown = (e) => {
        username = document.getElementById('nickname').value;
        if (username.length > 0 && e.code === 'Enter'){
            socket.emit('hey', username);
            socket.on('nickname_error', () => {
                document.getElementById('nickname-taken').style.display = 'block';
                document.getElementById('nickname').focus();
            });
            document.getElementById("login-form").style.display = "none";
            document.getElementById("message-board").style.display = "block";
        }
    }
}

message_input.onfocus = (e) => {
    socket.emit('typing', newUser);
};

message_input.onblur = (e) => {
    socket.emit('notTyping', newUser);
};

function sendMsg() {
    message = document.getElementById('message').value;
    if(message.length > 0){
        socket.emit('sendMsg', {user: newUser, message: message})
        message_list.appendChild(sendMessage("<strong class='user-name' style=\'color:" + newUser.color + "\'>" + newUser.username + "</strong> <br>" + message, newUser.color));
        document.getElementById('message').value = '';
    }
}

socket.on('user', (data) => {
    newUser = data.newUser;
    console.log(data.userList);
    data.userList.forEach((user) => {
        user_list.appendChild(newUserItem(user));
    });
});

socket.on('joined', (data) => {
    message_list.appendChild(messagePopup("<strong class='user-name' style=\'color:" + data.color + "\'>" + data.username + "</strong> joined", data.color));
    user_list.appendChild(newUserItem(data));
});

socket.on('recieveMsg', (data) => {
    let newLi = newMessage("<strong class='user-name' style=\'color:" + data.user.color + "\'>" + data.user.username + "</strong> <br>" + data.message, data.user.color);
    message_list.appendChild(newLi);
    message_list.scrollTop = message_list.scrollHeight - newLi.clientHeight;
});

socket.on('isTyping', (data) => {
    isTypingMsg(data);
});

socket.on('isNotTyping', (data) => {
    isNotTypingMsg(data);
});

socket.on('left', (data) => {
    message_list.appendChild(messagePopup("<strong class='user-name' style=\'color:" + data.color + "\'>" + data.username + "</strong> left", data.color));
    document.getElementById(data.username).style.display = 'none';

});

window.addEventListener('beforeunload', () => {
    socket.emit('leave', newUser);
    socket.emit('notTyping', newUser);
});
