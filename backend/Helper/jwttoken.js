export const sendToken = (user, statuscode, res) => {
  const token = user.getjwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.EXPIRE_COOKIE * 24 * 60 * 60 * 100,
    ),
    httpOnly: true,
  };
  res.status(statuscode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};  
