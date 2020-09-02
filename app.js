let express = require("express"),
    path = require("path"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io")(server, {
        perMessageDeflate: false
    }),
    port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log("Server is started at http://localhost:%d", port);
});

app.use(express.static(path.join(__dirname, 'public')));

const colors = ['red', 'green', 'blue', 'pink', 'purple'];

let color = 0;

let User =  function(username) {
    this.username = username;
    this.color = colors[color++];
}
let users = [];


io.on('connect', socket => {
    socket.on('hey', (data)=>{
        let newUser = new User(data)
        users.push(newUser);
        socket.emit('user', {userList: users, newUser: newUser});
        socket.broadcast.emit('joined', newUser);
    });

    socket.on("sendMsg", (data) => {
        // console.log(data);
        socket.broadcast.emit("recieveMsg", {user: data.user, message: data.message});
    }); 

    socket.on('typing', (data) => {
        socket.broadcast.emit("isTyping", data);
    });

    socket.on('notTyping', (data) => {
        socket.broadcast.emit("isNotTyping", data);
    });

    socket.on('leave', (data) => {
        socket.broadcast.emit("left", data);
        users = users.filter((user) => {return user.username !== data.username;});
    });
});

