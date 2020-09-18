let url = require("url"),
  { EventEmitter } = require("events"),
  User = function (username, user_profile, color) {
    this.username = username;
    this.user_profile = user_profile;
    this.color = colors[color++];
  },
  ee = new EventEmitter();

const colors = [
  "Black",
  "Blue",
  "Brown",
  "BurlyWood",
  "CadetBlue",
  "Chartreuse",
  "Chocolate",
  "Coral",
  "Cornsilk",
  "Crimson",
  "Cyan",
  "DarkBlue",
  "DarkCyan",
  "DarkGoldenRod",
  "DarkGray",
  "DarkGrey",
  "DarkGreen",
  "DarkKhaki",
  "DarkMagenta",
  "DarkOliveGreen",
  "DarkOrange",
  "DarkOrchid",
  "DarkRed",
  "DarkSalmon",
  "DarkSeaGreen",
  "DarkSlateBlue",
  "DarkSlateGray",
  "DarkSlateGrey",
  "DarkTurquoise",
  "DarkViolet",
  "DeepPink",
  "DeepSkyBlue",
  "DimGray",
  "DimGrey",
  "DodgerBlue",
  "FireBrick",
  "FloralWhite",
  "ForestGreen",
  "Fuchsia",
  "Gainsboro",
  "GhostWhite",
  "Gold",
  "GoldenRod",
  "Gray",
  "Grey",
  "Green",
  "GreenYellow",
  "HoneyDew",
  "HotPink",
  "IndianRed ",
  "Indigo  ",
  "Ivory",
  "Khaki",
  "Lavender",
  "LavenderBlush",
  "LawnGreen",
  "LemonChiffon",
  "LightBlue",
  "LightCoral",
  "LightCyan",
  "LightGoldenRodYellow",
  "LightGray",
  "LightGrey",
  "LightGreen",
  "LightPink",
  "LightSalmon",
  "LightSeaGreen",
  "LightSkyBlue",
  "LightSlateGray",
  "LightSlateGrey",
  "LightSteelBlue",
  "LightYellow",
  "Lime",
  "LimeGreen",
  "Linen",
  "Magenta",
  "Maroon",
  "MediumAquaMarine",
  "MediumBlue",
  "MediumOrchid",
  "MediumPurple",
  "MediumSeaGreen",
  "MediumSlateBlue",
  "MediumSpringGreen",
  "MediumTurquoise",
  "MediumVioletRed",
  "MidnightBlue",
  "MintCream",
  "MistyRose",
  "Moccasin",
  "NavajoWhite",
  "Navy",
  "OldLace",
  "Olive",
  "OliveDrab",
  "Orange",
  "OrangeRed",
  "Orchid",
  "PaleGoldenRod",
  "PaleGreen",
  "PaleTurquoise",
  "PaleVioletRed",
  "PapayaWhip",
  "PeachPuff",
  "Peru",
  "Pink",
  "Plum",
  "PowderBlue",
  "Purple",
  "RebeccaPurple",
  "Red",
  "RosyBrown",
  "RoyalBlue",
  "SaddleBrown",
  "Salmon",
  "SandyBrown",
  "SeaGreen",
  "SeaShell",
  "Sienna",
  "Silver",
  "SkyBlue",
  "SlateBlue",
  "SlateGray",
  "SlateGrey",
  "Snow",
  "SpringGreen",
  "SteelBlue",
  "Tan",
  "Teal",
  "Thistle",
  "Tomato",
  "Turquoise",
  "Violet",
  "Wheat",
  "White",
  "WhiteSmoke",
  "Yellow",
  "YellowGreen",
]; // To Assign a new Color to each new User

const namespace = {}; // will store the existing namespaces

module.exports = (io) => {
  io.on("connection", (user) => {
    const { ns } = url.parse(user.handshake.url, true).query;
    if (!ns) {
      user.disconnect();
      return { err: "ns not provided" };
    }
    if (!namespace[ns]) {
      namespace[ns] = true;
      io.of(ns).on("connection", (socket) => {
        let room = ns.split("/")[2].toUpperCase();
        ee.emit("chat", socket, room);
      });
    }
  });
  return ee;
};
let nsps = {};
ee.on("chat", (socket, ns) => {
  if (!nsps[ns]) {
    nsps[ns] = [];
  }
  // Registers each user after checking if they have a unique nickname or not
  // and sends a signal to all clients to register the user on their side
  socket.on("hey", (data) => {
    let taken = false;
    nsps[ns].forEach((user) => {
      if (user.username === data.username) {
        socket.emit("nickname_error");
        console.log(`[${ns} Room] [NICKNAME ERROR] ${data.username} is Taken`);
        taken = true;
        socket.disconnect();
      }
    });
    if (!taken) {
      let newUser = new User(data.username, data.user_profile, nsps[ns].length);
      console.log(
        `[${ns} Room] [NEW CONNECTION] ${newUser.username} is Now Connected.`
      );
      nsps[ns].push(newUser);
      console.log(`[${ns} Room] [USER COUNT] ${nsps[ns].length} users online`);
      socket.emit("user", { userList: nsps[ns], newUser: newUser });
      socket.broadcast.emit("joined", newUser);
    }
  });

  // Listens for an incoming message and passes it on to the other users
  socket.on("sendMsg", (data) => {
    socket.broadcast.emit("recieveMsg", {
      user: data.user,
      message: data.message,
    });
  });

  socket.on("getUsers", () => {
    socket.emit("allUsers", nsps[ns]);
  });

  // Listens for the 'typing' signal and tell other clients who is typing
  socket.on("typing", (data) => {
    socket.broadcast.emit("isTyping", data);
  });

  // Listens for the 'notTyping' signal and tell other clients that the user stopped typing
  socket.on("notTyping", (data) => {
    socket.broadcast.emit("isNotTyping", data);
  });

  // Listens for an incoming request to leave the server and takes it off the users list
  // and tells other clients tabout the same
  socket.on("leave", (data) => {
    nsps[ns] = nsps[ns].filter((user) => {
      return user.username !== data.username;
    });
    console.log(`[${ns} Room] [USER LEFT] ${data.username} is now Offline`);
    console.log(`[${ns} Room] [USER COUNT] ${nsps[ns].length} users online`);
    socket.broadcast.emit("left", data);
  });
});
