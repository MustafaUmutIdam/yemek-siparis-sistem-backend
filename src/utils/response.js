const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
  };
};

const errorResponse = (message = 'Error', code = 'ERROR', statusCode = 400) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  successResponse,
  errorResponse,
};
