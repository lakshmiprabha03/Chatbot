const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const projectSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500),
  config: Joi.object({
    model: Joi.string().default('gpt-3.5-turbo'),
    temperature: Joi.number().min(0).max(2).default(0.7),
    maxTokens: Joi.number().min(1).max(4000).default(150)
  })
});

const chatSchema = Joi.object({
  projectId: Joi.string().required(),
  message: Joi.string().min(1).max(1000).required()
});

module.exports = { userSchema, loginSchema, projectSchema, chatSchema };