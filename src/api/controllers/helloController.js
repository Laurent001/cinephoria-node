const getHello = (req, res) => {
  console.log("hello");

  res.json({ message: "Hello from the backend!" });
};

module.exports = {
  getHello,
};
