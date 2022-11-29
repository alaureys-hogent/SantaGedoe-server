const uuid =  require('uuid');

const { getChildLogger } = require('../core/logging');
const { tables, getKnex } = require('../data/index');


/**
 * Columns to be included in the query.
 */
const SELECT_COLUMNS = [
  `${tables.gift}.id`, 'name', 'comments', 'url', 'isReserved', 'reservedBy', 'isReceived',
  `${tables.user}.id as user_id`,
];
/**
 * Format for Gift object.
 */
const formatGift = (
  {user_id, 
    ...rest
  }) => ({
  ...rest,
  user: {
    id: user_id,
  },
});
/**
 * Find all gifts to a user by a given `user_id`.
 * @param {string} user_id - Id of the user.
 * @param {object} pagination - Pagination options.
 * @param {number} pagination.limit - Nr of places to return.
 * @param {number} pagination.offset - Nr of places to skip.
 */
const findAllByUserId = async (user_id, {limit, offset}) => {
  const gift = await getKnex()(tables.gift)
    .select(SELECT_COLUMNS)
    .join(tables.user, `${tables.gift}.user_id`, '=', `${tables.user}.id`)
    .where(`${tables.gift}.user_id`, user_id)
    .limit(limit)
    .offset(offset)
    .orderBy('name', 'DESC');

  return gift.map(formatGift);
};

/**
 * Calculate the total number of gifts.
 */
const findCount = async (user_id) => {
  const [count] =  await getKnex()(tables.gift)
    .select()
    .where(`${tables.gift}.user_id`, user_id)
    .count();

  return count['count(*)'];
};

/**
 * Find a gift with the given `id`.
 *
 * @param {number} id - Id of the gift to find.
 */
const findById = async (id) => {
  const gift = await getKnex()(tables.gift)
    .where(`${tables.gift}.id`, id)
    .join(tables.user, `${tables.gift}.user_id`, '=', `${tables.user}.id`)
    .first(SELECT_COLUMNS);
  
  return gift && formatGift(gift);
};

/**
 * Create a new gift with the given `gift`,`restaurant_id` and `user_id`.
 *
 * @param {object} gift - Gift to create.
 * @param {string} [gift.name] - Gift of the gift.
 * @param {string} [gift.restaurant_id] - Restaurant linked to the gift.
 * @param {number} [gift.user_id] - User linked to the gift.
 * 
 * @returns {Promise<number>} Created gift's id
 */
const create = async ({
  name,
  comments,
  url,
  user_id,
}) => {
  try {
    const id = uuid.v4();
    await getKnex()(tables.gift)
      .insert({
        id,
        name,
        comments,
        url,
        user_id: user_id,
      });
    return await findById(id);
  } catch (error) {
    const logger = getChildLogger('gifts-repo');
    logger.error('Error in create', {
      error,
    });
    throw error;
  }
};

/**
 * Update an existing Gift with the given `Gift`,`restaurant_id` and `user_id`.
 *
 * @param {number} id - Id of the Gift to update.
 * @param {object} gift - Gift to update.
 * @param {string} [Gift.Gift] - Gift of the Gift.
 * @param {string} [Gift.restaurant_id] - Restaurant linked to the Gift.
 * @param {number} [Gift.user_id] - User linked to the Gift.
 * 
 * @returns {Promise<number>} Updated Gift's id
 */
const updateById = async (id, {
  isReserved,
  reservedBy,
}) => {
  try {
    await getKnex()(tables.gift)
      .update({
        isReserved,
        reservedBy,
      })
      .where(`${tables.gift}.id`, id);
    return await findById(id);
  } catch (error) {
    const logger = getChildLogger('gifts-repo');
    logger.error('Error in updateById', {
      error,
    });
    throw error;
  }
};

/**
 * Delete a Gift.
 *
 * @param {number} id - Id of the Gift to delete.
 *
 * @returns {Promise<boolean>} Whether the Gift was deleted.
 */
const deleteById = async (id) => {
  try {
    const rowsAffected = await getKnex()(tables.gift)
      .delete()
      .where(`${tables.gift}.id`, id);
    return rowsAffected > 0;
  } catch (error) {
    const logger = getChildLogger('gifts-repo');
    logger.error('Error in deleteById', {
      error,
    });
    throw error;
  }
};

module.exports = {
  findAllByUserId,
  findCount,
  findById,
  create,
  updateById,
  deleteById,
};

