import Joi from 'joi';

export const authValidation = {
  register: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).optional(),
    password: Joi.string().min(8).required(),
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    user_type: Joi.string().valid('viewer', 'filmmaker').default('viewer')
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  verifyEmail: Joi.object({ token: Joi.string().uuid().required() }),
  requestPasswordReset: Joi.object({ email: Joi.string().email().required() }),
  resetPassword: Joi.object({ token: Joi.string().uuid().required(), password: Joi.string().min(8).required() }),
  updateProfile: Joi.object({
    first_name: Joi.string().min(2).max(100).optional(),
    last_name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).optional(),
    avatar_url: Joi.string().uri().optional()
  }),
  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).required()
  })
};

export const movieValidation = {
  create: Joi.object({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(1000).optional(),
    synopsis: Joi.string().optional(),
    poster_url: Joi.string().uri().optional(),
    backdrop_url: Joi.string().uri().optional(),
    trailer_url: Joi.string().uri().optional(),
    release_date: Joi.date().optional(),
    duration_minutes: Joi.number().integer().min(1).optional(),
    category_id: Joi.string().uuid().optional(),
    language: Joi.string().max(50).optional(),
    country: Joi.string().max(100).optional()
  }),
  update: Joi.object({
    title: Joi.string().min(2).max(255).optional(),
    description: Joi.string().max(1000).optional(),
    synopsis: Joi.string().optional(),
    poster_url: Joi.string().uri().optional(),
    backdrop_url: Joi.string().uri().optional(),
    trailer_url: Joi.string().uri().optional(),
    release_date: Joi.date().optional(),
    duration_minutes: Joi.number().integer().min(1).optional(),
    category_id: Joi.string().uuid().optional(),
    language: Joi.string().max(50).optional(),
    country: Joi.string().max(100).optional(),
    status: Joi.string().valid('pending', 'approved', 'rejected', 'draft').optional(),
    is_featured: Joi.boolean().optional()
  }),
  query: Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected', 'draft').optional(),
    category_id: Joi.string().uuid().optional(),
    filmmaker_id: Joi.string().uuid().optional(),
    is_featured: Joi.boolean().optional(),
    search: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
    sort_by: Joi.string().valid('created_at', 'title', 'release_date', 'average_rating').default('created_at'),
    order: Joi.string().valid('ASC', 'DESC').default('DESC')
  })
};

export const categoryValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    slug: Joi.string().min(2).max(100).required(),
    icon_url: Joi.string().uri().optional()
  }),
  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    slug: Joi.string().min(2).max(100).optional(),
    icon_url: Joi.string().uri().optional(),
    is_active: Joi.boolean().optional()
  })
};

export const reviewValidation = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  review_text: Joi.string().max(2000).optional()
});

export const progressValidation = Joi.object({
  watch_time_seconds: Joi.number().integer().min(0).optional(),
  last_position_seconds: Joi.number().integer().min(0).optional(),
  is_completed: Joi.boolean().optional()
});

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({ success: false, error: 'Validation error', errors });
  }
  req.body = value;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({ success: false, error: 'Validation error', errors });
  }
  req.query = value;
  next();
};

