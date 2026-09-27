const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "news",
  idPrefix: "n",
  defaults: { author: "Sports Desk", category: "Community", status: "Published" },
  columns: [
    { field: "title", column: "title", type: "string" },
    { field: "image", column: "image", type: "string" },
    { field: "content", column: "content", type: "string" },
    { field: "excerpt", column: "excerpt", type: "string" },
    { field: "author", column: "author", type: "string" },
    { field: "category", column: "category", type: "string" },
    { field: "date", column: "news_date", type: "string" },
    { field: "status", column: "status", type: "string" },
  ],
});
