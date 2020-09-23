const namespace = window.location.pathname;
console.log(namespace);
const socket = io.connect(`${namespace}`, {
  query: `ns=${namespace}`,
  resource: "socket.io",
});

//DECLARATION OF ALL VARIABLES REQUIRED

let message_list = document.getElementById("message-list"),
  nickname = document.getElementById("nickname"),
  message = document.getElementById("message").value,
  message_input = document.getElementById("message"),
  username = user_nickname,
  isLoggedIn = false,
  user_list = document.getElementById("user-list"),
  newUser;

//DEFINITION OF EACH FUNCTION USED

// newMesaage() function adds a new 'li' item to the 'ul#message-list' with the respected message
// that came over the network
const newMessage = (data) => {
  const message = document.createElement("li");
  message.innerHTML =
    "<strong class='user-name' style='color:" +
    data.user.color +
    "'>" +
    data.user.username +
    "</strong> <br> <br>" +
    data.message;
  message.style.borderLeft = `5px solid ${data.user.color}`;
  message.classList.add("incoming");
  return message;
};

// sendMesaage() function adds a new 'li' item to the 'ul#message-list' with the respected message
// that this user wishes to send
const sendMessage = (user, message_text) => {
  const message = document.createElement("li");
  message.innerHTML =
    "<strong class='user-name' style='color:" +
    user.color +
    "'>" +
    user.username +
    "</strong> <br> <br>" +
    message_text;
  message.style.borderRight = `5px solid ${user.color}`;
  message.classList.add("outgoing");
  return message;
};

// newUserItem() function adds a new 'li' item to the 'ul#users' with the name of the
// new user that just joined
const newUserItem = (data) => {
  const user = document.createElement("li");
  user.id = data.username;
  user.innerHTML =
    "<img src=" +
    data.user_profile +
    " class='user-profile'> <span>" +
    data.username +
    "</span>";
  return user;
};

// messagePopup() function adds a new 'li' item to the 'ul#message-list' with the information
// about the joining and leaving of people from the chat
const messagePopup = (data, type) => {
  const message = document.createElement("li");
  message.innerHTML =
    "<strong class='user-name' style='color:" +
    data.color +
    "'>" +
    data.username +
    "</strong>  " +
    type;
  message.classList.add("popup");
  return message;
};

// isTypingMsg() function makes p#isTyping visible with the information
// about the respective user typing a message
const isTypingMsg = (user) => {
  const p = document.getElementById("isTyping");
  const s = document.getElementById("user-typing");
  p.style.visibility = "visible";
  s.innerHTML = user.username;
  s.style.color = user.color;
  p.style.borderLeft = `5px solid ${user.color}`;
  p.classList.add("incoming");
};

// isTypingMsg() function makes p#isTyping invisible that has the information
// about the respective user typing a message
const isNotTypingMsg = (user) => {
  const p = document.getElementById("isTyping");
  p.style.visibility = "hidden";
};

// joinChat() function lets the user join the chat when they have entered their
// respective nickname
function joinChat() {
  let taken = false;
  socket.emit("hey", { username: username, user_profile: user_profile });
  isLoggedIn = true;
}

// sendMsg() function lets the user send their message on to the sever to be seen by every one
function sendMsg() {
  message = document.getElementById("message").value;
  if (message.length > 0) {
    socket.emit("sendMsg", { user: newUser, message: message });
    message_list.appendChild(sendMessage(newUser, message));
    document.getElementById("message").value = "";
    document.getElementById("message").focus();
    document.getElementById("message-list").scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "start",
    });
  }
}

// sends the 'typing' info on the server when a user starts typing on the message input
message_input.onfocus = () => {
  socket.emit("typing", newUser);
  document.getElementById("message-list").scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "end",
  });
};

// sends a msg when 'Enter' key is pressed
message_input.onkeydown = (e) => {
  if (e.code === "Enter") {
    sendMsg();
  }
};

// sends the 'notTyping' info on the server when a user stops typing on the message input
message_input.onblur = (e) => {
  socket.emit("notTyping", newUser);
};

// LISTENERS FOR THE EVENTS HAPPENING ON THE SERVER

// tells to stop executing when the server detects a duplicate 'nickname'
socket.on("nickname_error", () => {
  // document.getElementById("message-board").style.display = "none";
  // document.getElementById('nickname-taken').style.display = 'flex';
  let form = document.createElement("form");
  form.setAttribute("method", "GET");
  form.setAttribute("action", namespace);
  let hiddenField = document.createElement("input");
  hiddenField.setAttribute("type", "hidden");
  hiddenField.setAttribute("name", "taken");
  hiddenField.setAttribute("value", true);
  form.appendChild(hiddenField);
  document.body.appendChild(form);
  form.submit();
});

// recieves the info about the current users on the server
socket.on("user", (data) => {
  newUser = data.newUser;
  data.userList.forEach((user) => {
    user_list.appendChild(newUserItem(user));
  });
});

// recieves the info about the new users that join the srever
socket.on("joined", (data) => {
  message_list.appendChild(messagePopup(data, "joined"));
  user_list.appendChild(newUserItem(data));
  document.getElementById("message-list").scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "end",
  });
});

// recieves the message send by the users on the server
socket.on("recieveMsg", (data) => {
  message_list.appendChild(newMessage(data));
  document.getElementById("message-list").scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "end",
  });
});

//recieves the info about the user who is typing
socket.on("isTyping", (data) => {
  isTypingMsg(data);
});

//recieves the signal when the user stops typing
socket.on("isNotTyping", (data) => {
  isNotTypingMsg(data);
});

// recieves the info when a user leaves the server
socket.on("left", (data) => {
  message_list.appendChild(messagePopup(data, "left"));
  document.getElementById(data.username).style.display = "none";
});

// sends the signal to server to disconnect when the client closes the chat window
window.addEventListener("beforeunload", () => {
  if (isLoggedIn) {
    socket.emit("leave", newUser);
    socket.emit("notTyping", newUser);
  }
});

joinChat();
