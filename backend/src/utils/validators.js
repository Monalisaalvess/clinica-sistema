const Joi = require('joi');

const schemaSignup = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
  
  nome: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  
  telefone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Telefone inválido (10-15 dígitos)',
      'any.required': 'Telefone é obrigatório'
    }),
  
  cpf: Joi.string()
    .pattern(/^\d{11}$/)
    .messages({
      'string.pattern.base': 'CPF deve ter 11 dígitos'
    }),
  
  senha: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
  
  senhaConfirm: Joi.string()
    .valid(Joi.ref('senha'))
    .required()
    .messages({
      'any.only': 'Senhas não correspondem',
      'any.required': 'Confirmação de senha é obrigatória'
    }),
  
  role: Joi.string()
    .valid('admin', 'medico', 'paciente', 'recepcionista')
    .default('paciente'),
  
  especialidade: Joi.string()
    .when('role', {
      is: 'medico',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Especialidade é obrigatória para médicos'
    }),
  
  crm: Joi.string()
    .when('role', {
      is: 'medico',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'CRM é obrigatório para médicos'
    }),
  
  tempoConsultaMinutos: Joi.number()
    .min(15)
    .max(120)
    .default(30)
    .when('role', {
      is: 'medico',
      then: Joi.required()
    })
});


const schemaLogin = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
  
  senha: Joi.string()
    .required()
    .messages({
      'any.required': 'Senha é obrigatória'
    })
});

const validar = (schema, objeto) => {
  const { error, value } = schema.validate(objeto, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const erros = {};
    error.details.forEach(detail => {
      erros[detail.path[0]] = detail.message;
    });
    throw { status: 400, erros };
  }
  
  return value;
};

module.exports = {
  schemaSignup,
  schemaLogin,
  validar
};