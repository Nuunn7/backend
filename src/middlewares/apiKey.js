module.exports = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== process.env.EXTERNAL_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};