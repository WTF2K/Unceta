function createValidationError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requiredText(value, label, maxLength) {
  if (typeof value !== 'string' || !value.trim()) throw createValidationError(`${label} is required.`);
  if (value.trim().length > maxLength) throw createValidationError(`${label} must contain at most ${maxLength} characters.`);
  return value.trim();
}

function optionalText(value, label, maxLength) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw createValidationError(`${label} must be text.`);
  if (value.length > maxLength) throw createValidationError(`${label} must contain at most ${maxLength} characters.`);
  return value;
}

function imageUrl(value) {
  if (value === undefined || value === null || value === '') return value || null;
  if (typeof value !== 'string' || (!value.startsWith('/Images/') && !/^https?:\/\//.test(value))) {
    throw createValidationError('Image must be an uploaded URL or a /Images/ asset path.');
  }
  return value;
}

function isUniqueError(error) {
  return error?.name === 'SequelizeUniqueConstraintError';
}

module.exports = { createValidationError, imageUrl, isUniqueError, optionalText, requiredText };