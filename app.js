// DECLARATION OF ALL REQUIRE VARIABLES

let express = require("express"),
    path = require("path"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io")(server, {
        perMessageDeflate: false
    }),
    color = 0,
    User =  function(username) {  
        this.username = username;
        this.color = colors[color++];
    },  //User model
    users = [], //List of all the users currently active
    port = process.env.PORT || 3000;

const colors = ['Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGrey', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkSlateGrey', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DimGrey', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Grey', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed ', 'Indigo  ', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGrey', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSlateGrey', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'SlateGrey', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'
]; // To Assign a new Color to each new User

// SETTING UP THE SERVER

server.listen(port, () => {
    console.log("[SERVER ONLINE] Server started at http://localhost:%d", port);
});

app.use(express.static(path.join(__dirname, 'public')));


// SETTING UP SOCKET TO START LISTENING
io.on('connect', socket => {

    // Registers each user after checking if they have a unique nickname or not 
    // and sends a signal to all clients to register the user on their side
    socket.on('hey', (data)=>{
        let taken = false;
        users.forEach((user) => {
            if(user.username === data){
                socket.emit('nickname_error');
                console.log(`[NICKNAME ERROR] ${data} is Taken`);
                taken = true;
            }
        });
        if(!taken){
            let newUser = new User(data)
            console.log(`[NEW CONNECTION] ${newUser.username } is Now Connected.`);
            console.log(`[USER COUNT] ${color} users online`);
            users.push(newUser);
            socket.emit('user', {userList: users, newUser: newUser});
            socket.broadcast.emit('joined', newUser);
        }
    });

    // Listens for an incoming message and passes it on to the other users
    socket.on("sendMsg", (data) => {
        socket.broadcast.emit("recieveMsg", {user: data.user, message: data.message});
    }); 

    // Listens for the 'typing' signal and tell other clients who is typing 
    socket.on('typing', (data) => {
        socket.broadcast.emit("isTyping", data);
    });

    // Listens for the 'notTyping' signal and tell other clients that the user stopped typing 
    socket.on('notTyping', (data) => {
        socket.broadcast.emit("isNotTyping", data);
    });

    // Listens for an incoming request to leave the server and takes it off the users list
    // and tells other clients tabout the same
    socket.on('leave', (data) => {
        color--;
        console.log(`[USER LEFT] ${data.username} is now Offline`)
        console.log(`[USER COUNT] ${color} users online`);
        socket.broadcast.emit("left", data);
        users = users.filter((user) => {return user.username !== data.username;});
    });
});

