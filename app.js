// DECLARATION OF ALL REQUIRE VARIABLES
let express = require("express"),
    path = require("path"),
    app = express(),
    bodyParser = require("body-parser"),
    server = require("http").createServer(app),
    io = require("./io").initialize(server),
    port = process.env.PORT || 3000,
    generalRoutes = require("./routes/general");

// SETTING UP THE SERVER
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended : true}));

app.get("/about", (req, res)=> {
    res.render("About");
});

app.use("/chat", generalRoutes);

app.get("/", (req, res)=> {
	res.render("index");
});

app.use(express.static(path.join(__dirname, 'public')));

io.on("connection", () => {});

server.listen(port, () => {
    console.log("[SERVER ONLINE] Server started at http://localhost:%d", port);
});
