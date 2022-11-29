const uuid = require('uuid');

const { tables, getKnex } = require('../data');
const { getChildLogger } = require('../core/logging');

/**
 * Find all users.
 * @param {object} pagination - Pagination options
 * @param {number} pagination.limit - Nr of transactions to return.
 * @param {number} pagination.offset - Nr of transactions to skip.
 */
const findAll = ({limit, offset, user_id}) => {
  return getKnex()(tables.user)
    .select()
    .limit(limit)
    .offset(offset)
    .whereNot('id', user_id)
    .orderBy('firstName', 'ASC');
};

/**
 * Calculate the total number of user.
 */
const findCount = async () => {
  const [count] = await getKnex()(tables.user)
    .count();
  return count['count(*)'];
};

/**
 * Find a user with the given id.
 *
 * @param {number} id - The id to search for.
 */
const findById = (id) => {
  return getKnex()(tables.user)
    .where('id', id)
    .first();
};

/**
 * Find a user with the given email.
 *
 * @param {string} email - The email to search for.
 */
const findByEmail = (email) => {
  console.debug('email:', email);
  return getKnex()(tables.user)
    .where('email', email)
    .first();
};

/**
 * Create a new user with the given `name`.
 *
 * @param {object} user - User to create.
 * @param {string} user.firstName - First name of the user.
 * @param {string} user.lastName - Last name of the user.
 * @param {string} user.email - Email of the user.
 *
 * @returns {Promise<number>} - Id of the created user.
 */
const register = async ({
  firstName,
  lastName,
  email,
  passwordHash,
  roles,
}) => {
  try {
    const id = uuid.v4();
    await getKnex()(tables.user)
      .insert({
        id,
        firstName,
        lastName,
        email,
        password_hash: passwordHash,
        roles: JSON.stringify(roles),
      });
    return await findById(id);
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in register', {
      error,
    });
    throw error;
  }
};

/**
 * Update a user with the given `id`.
 *
 * @param {string} id - Id of the user to update.
 * @param {object} user - User to save.
 * @param {string} user.firstName - First name of the user.
 * @param {string} user.lastName - Last name of the user.
 * @param {string} user.email - Email of the user.
 * 
 * @returns {Promise<number>} - Id of the updated user.
 */
const updateById = async (id, {
  firstName,
  lastName,
  email,
}) => {
  try {
    await getKnex()(tables.user)
      .update({
        firstName,
        lastName,
        email,
      })
      .where('id', id);
    return await findById(id);
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in updateById', {
      error,
    });
    throw error;
  }
};

/**
 * Delete a user with the given `id`.
 *
 * @param {string} id - Id of the user to delete.
 */
const deleteById = async (id) => {
  try {
    const rowsAffected = await getKnex()(tables.user)
      .delete()
      .where('id', id);
    return rowsAffected > 0;
  } catch (error) {
    const logger = getChildLogger('users-repo');
    logger.error('Error in deleteById', {
      error,
    });
    throw error;
  }
};

module.exports = {
  findAll,
  findCount,
  findById,
  register,
  updateById,
  deleteById,
  findByEmail,
};