module.exports = {
  secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  phoneRegex: /\d{3}-\d{3}-\d{4}/, // DDD-DDD-DDDD
  emailRegex: /\S+@\S+\.\S+/, // test@example.com
};
