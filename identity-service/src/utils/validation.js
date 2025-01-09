const joi = require('joi');

const validateRegisteration = (data) => {
  const schema = joi.object({
    username: joi.string().min(3).max(50).required().required(),
    email: joi.string().min(6).required().email().required(),
    password: joi.string().min(6).required(),
    firstName: joi.string().min(3),
    lastName: joi.string().min(3),
  });

  return schema.validate(data);
}

const validateLogin = (data) => {
  const schema = joi.object({
    email: joi.string().min(6).required().email().required(),
    password: joi.string().min(6).required(),
  });

  return schema.validate(data);
}


module.exports = { validateRegisteration, validateLogin }
