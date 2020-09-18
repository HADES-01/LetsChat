let express = require("express"),
  router = express.Router(),
  io = require("../io").io();

router.get("/", (req, res) => {
  res.render("createRoom");
});

router.post("/", (req, res) => {
  res.redirect("/chat/" + req.body.room_name);
});

require("../socket")(io);

router.get("/:id", (req, res) => {
  res.render("waiting", {
    room_name: req.params.id,
    taken: req.query.taken || false,
  });
});

router.post("/:id", (req, res) => {
  let nickname = req.body.nickname,
    user_profile = req.body.user_profile;
  res.render("chat", { nickname: nickname, user_profile: user_profile });
});

module.exports = router;
