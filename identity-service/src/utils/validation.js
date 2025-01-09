const joi = require('joi');

const validateRegisteration = (data) => {
  const schema = joi.object({
    username: joi.string().min(3).max(50).required().required(),
    email: joi.string().min(6).required().email().required(),
    firstName: joi.string().min(3).required(),
    lastName: joi.string().min(3).required(),
    password: joi.string().min(6).required(),
  });

  return schema.validate(data);
}


module.exports = { validateRegisteration }
