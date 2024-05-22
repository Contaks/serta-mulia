const postPredictHandler = require("../server/handler");

const routes = [
  {
    path: "/predict",
    method: "POST",
    handler: postPredictHandler,
    options: {
      payload: {
        maxBytes: 1000000, // Batasi ukuran file maksimal 1MB
        parse: true,
        allow: "multipart/form-data",
      },
    },
  },
];

module.exports = routes;
