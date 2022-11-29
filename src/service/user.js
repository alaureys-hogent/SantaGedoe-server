const config = require('config');

const { getChildLogger } = require('../core/logging');
const {verifyPassword, hashPassword} = require('../core/password');
const {generateJWT, verifyJWT} = require('../core/jwt');
const Role = require('../core/roles');
const ServiceError = require('../core/serviceError');
const userRepository = require('../repository/user');


const DEFAULT_PAGINATION_LIMIT = config.get('pagination.limit');
const DEFAULT_PAGINATION_OFFSET = config.get('pagination.offset');

const debugLog = (message, meta = {}) => {
  if(!this.logger) this.logger = getChildLogger('user-service');
  this.logger.debug(message, meta);
};

const makeExposedUser = ({id, firstName, lastName, email, roles, img}) => ({id, firstName, lastName, email, roles, img});

const makeLoginData = async (user) => {
  const token = await generateJWT(user);
  return {
    user: makeExposedUser(user),
    token,
  };
};

/**
 * Register a new user
 *
 * @param {object} user - User to create.
 * @param {string} user.firstName - First name of the user.
 * @param {string} user.lastName - Last name of the user.
 * @param {string} user.email - Email of the user.
 * @param {string} user.password - Password of the user.
 */
const register = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  debugLog('Creating a new user', { firstName, lastName, email });
  const passwordHash = await hashPassword(password);
  const user = await userRepository.register({ 
    firstName, 
    lastName, 
    email, 
    passwordHash, 
    roles: [Role.USER], 
  });

  return await makeLoginData(user);
};

/**
 * Login a user
 *
 * @param {object} user - User to create.
 * @param {string} user.email - Email of the user.
 * @param {string} user.password - Password of the user.
 */
const login = async (email, password) => {
  const user =  await userRepository.findByEmail(email);
  if(!user){
    throw ServiceError.unauthorized('The given email and password do not match');
  }

  const passwordValid = await verifyPassword(password, user.password_hash);

  if(!passwordValid){
    throw ServiceError.unauthorized('The given email and password do not match');
  }

  return await makeLoginData(user);
};

/**
 * Get all users.
 */
const getAll = async (limit = DEFAULT_PAGINATION_LIMIT, offset = DEFAULT_PAGINATION_OFFSET, user_id) => {
  debugLog('Fetching all users', {limit, offset});
  const data = await userRepository.findAll({limit, offset, user_id});
  const totalCount = await userRepository.findCount();
  return {
    data: data.map(makeExposedUser),
    count: totalCount,
    limit,
    offset,
  };
};

/**
 * Get the user with the given id.
 *
 * @param {string} id - Id of the user to get.
 * 
 * @throws {ServiceError} one of:
 * - NOt_FOUND: No user with the given id could be found.
 */
const getById = async (id) => {
  debugLog(`Fetching user with id ${id}`);
  const user = await userRepository.findById(id);

  if(!user){
    throw ServiceError.notFound(`No user with id ${id} exists`, {id});
  }

  return makeExposedUser(user);
};

/**
 * Update an existing user.
 *
 * @param {string} id - Id of the user to update.
 * @param {object} user - User to save.
 * @param {string} user.firstName - First name of the user.
 * @param {string} user.lastName - Last name of the user.
 * @param {string} user.email - Email of the user.
 * 
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No user with the given id could be found.
 * - VALIDATION_FAILED: A user with the same email exists.
 */
const updateById = async (id, { firstName, lastName, email }) => {
  debugLog(`Updating user with id ${id}`, { firstName, lastName, email });
  const user = await userRepository.updateById(id, { firstName, lastName, email });
  return makeExposedUser(user);
};

/**
 * Delete an existing user.
 *
 * @param {string} id - Id of the user to delete.
 * 
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No user with the given id could be found.
 */
const deleteById = async (id) => {
  debugLog(`Deleting user with id ${id}`);
  const deleted = await userRepository.deleteById(id);

  if(!deleted){
    throw ServiceError.notFound(`No user iht id ${id} exists`, {id});
  }
};

/**
 * Check and parse a JWT from the given header into a valid session
 * if possible.
 *
 * @param {string} authHeader - The bare 'Authorization' header to parse
 *
 * @throws {ServiceError} One of:
 * - UNAUTHORIZED: Invalid JWT token provided, possible errors:
 *   - no token provided
 *   - incorrect 'Bearer' prefix
 *   - expired JWT
 *   - other unknown error
 */


async function checkAndParseSession(authHeader) {
  if(!authHeader) {
    throw ServiceError.unauthorized('You need to be signed in');
  }
 
  if(!authHeader.startsWith('Bearer ')) {
    throw ServiceError.unauthorized('Invalid authentication token');
  }
  const authToken = authHeader.substr(7);
  // console.debug('authToken: ', authToken);
  try {
    const {
      roles, userId,
    } = await verifyJWT(authToken);

    return {userId, roles, authToken};
 
  } catch (error) {
    const logger = getChildLogger('user-service');
    logger.error(error.message, {error});
    throw ServiceError.unauthorized(error.message);
  }
}

/**
 * Check if the given roles include the given required role.
 *
 * @param {string} role - Role to require.
 * @param {string[]} roles - Roles of the user.
 *
 * @returns {void} Only throws if role not included.
 *
 * @throws {ServiceError} One of:
 * - UNAUTHORIZED: Role not included in the array.
 */
const checkRole = (role, roles) => {
  const hasPermission = roles.includes(role);

  if (!hasPermission) {
    throw ServiceError.forbidden('You are not allowed to view this part of the application');
  }
};

module.exports = {
  register,
  login,
  getAll,
  getById,
  updateById,
  deleteById,
  checkAndParseSession,
  checkRole,
};