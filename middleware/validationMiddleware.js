const validateRequest = (schema) => {
  return (req, res, next) => {
    console.log('🔍 Validation middleware - Request body:', req.body);
    
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }

    const { error, value } = schema.validate(req.body);
    
    if (error) {
      console.log('❌ Validation error:', error.details[0].message);
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Replace req.body with the validated value
    req.body = value;
    console.log('✅ Validation passed');
    next();
  };
};

module.exports = { validateRequest };