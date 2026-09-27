const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "settings",
  idFrom: "key",
  defaults: {
    key: "site",
    clubName: "Sindhuli Football Clubhouse",
    tagline: "Manage. Play. Connect.",
    heroText: "Your home for football in Sindhuli.",
    about: "",
  },
  columns: [
    { field: "key", column: "setting_key", type: "string" },
    { field: "clubName", column: "club_name", type: "string" },
    { field: "tagline", column: "tagline", type: "string" },
    { field: "heroText", column: "hero_text", type: "string" },
    { field: "about", column: "about_text", type: "string" },
  ],
});
