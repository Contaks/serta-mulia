const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const storeData = require("../services/storeData");
const InputError = require("../exceptions/InputError");

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  if (!image || image.bytes > 1000000) {
    throw new InputError(
      "Payload content length greater than maximum allowed: 1000000"
    );
  }

  try {
    const { confidenceScore, label, explanation, suggestion } =
      await predictClassification(model, image._data);

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id,
      result: label,
      suggestion: suggestion || "Segera periksa ke dokter!",
      createdAt,
    };

    await storeData(id, data);

    return h
      .response({
        status: "success",
        message: "Model is predicted successfully",
        data,
      })
      .code(201);
  } catch (error) {
    console.error(error);
    return h
      .response({
        status: "fail",
        message: "Terjadi kesalahan dalam melakukan prediksi",
      })
      .code(400);
  }
}

module.exports = postPredictHandler;
