require("dotenv").config();
const Hapi = require("@hapi/hapi");
const routes = require("../server/routes");
const loadModel = require("../services/loadModel");
const InputError = require("../exceptions/InputError");

(async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
      payload: {
        maxBytes: 1000000, // Batasi ukuran file maksimal 1MB
        parse: true,
        multipart: true,
        output: "stream",
      },
    },
  });

  const model = await loadModel();
  server.app.model = model;

  server.route(routes);

  server.ext("onPreResponse", function (request, h) {
    const response = request.response;

    if (response.isBoom) {
      if (response.output.statusCode === 413) {
        return h
          .response({
            status: "fail",
            message:
              "Payload content length greater than maximum allowed: 1000000",
          })
          .code(413);
      }

      const newResponse = h.response({
        status: "fail",
        message:
          response.message || "Terjadi kesalahan dalam melakukan prediksi",
      });
      newResponse.code(response.output.statusCode);
      return newResponse;
    }

    if (response instanceof InputError) {
      const newResponse = h.response({
        status: "fail",
        message: `${response.message} Silakan gunakan foto lain.`,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server started at: ${server.info.uri}`);
})();
