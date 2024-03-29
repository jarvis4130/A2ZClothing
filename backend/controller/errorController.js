const AppError = require("./../utils/AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleValidationErrorDB=(err)=>{

  const errors=Object.values(err.errors).map(el=>el.message)

  const message=`Invalid Input Data. ${errors.join('. ')}`;

  return new AppError(message,400)
}

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } 
  else {
    // res.status(500).json({
    //   status: "error",
    //   message: "Something went very wrong!",
    // });
    
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

};

const handleJWTError=()=>{
  return new AppError('Invalid token. Please log in again!', 401);
}

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = Object.create(err);
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendErrorProd(error, res);
};
