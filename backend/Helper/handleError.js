class HandleError extends Error {
  constructor(message, statcode) {
    super(message);
    this.statcode = statcode;
    Error.captureStackTrace(this, HandleError);
  }
}
export default HandleError;
