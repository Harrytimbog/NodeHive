const joi = require('joi');

const validateCreatePost = (data) => {
  const schema = joi.object({
    title: joi.string().min(3).required(),
    content: joi.string().min(6).required(),
  });

  return schema.validate(data);
}

module.exports = { validateCreatePost }
