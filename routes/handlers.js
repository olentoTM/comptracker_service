exports.notFound = (req, res) => {
  res.status(404);
  res.send("404 - Not Found");
};

exports.internalServerError = (err, req, res, next) => {
  console.error(err.message);
  res.status(500);
  res.send("500 - Server Error");
};
