let url = document.getElementById("url");
url.innerHTML += window.location.href.split("?")[0];
function copyToClipboard() {
  var range = document.createRange();
  range.selectNode(document.getElementById("url"));
  window.getSelection().removeAllRanges(); // clear current selection
  window.getSelection().addRange(range); // to select text
  document.execCommand("copy");
  console.log("copied");
  window.getSelection().removeAllRanges(); // to deselect
}

const namespace = window.location.pathname;
console.log(window.location.href);
const socket = io.connect(window.location.href, {
  query: `ns=${namespace}`,
  resource: "socket.io",
});

socket.emit("getUsers");
socket.on("allUsers", (data) => {
  data.forEach((element) => {
    let newUser = document.createElement("li");
    document.getElementById("user-area").appendChild(newUser);
    newUser.innerHTML =
      "<img src='" +
      element.user_profile +
      "'><span>" +
      element.username +
      "</span";
    newUser.id = element.username;
  });
});
socket.on("joined", (data) => {
  console.log(data);
  let newUser = document.createElement("li");
  let user_area = document.getElementById("user-area");
  user_area.appendChild(newUser);
  newUser.innerHTML =
    "<img src='" + data.user_profile + "'><span>" + data.username + "</span";
  newUser.id = data.username;
});
socket.on("left", (data) => {
  document.getElementById(data.username).style.display = "none";
});
