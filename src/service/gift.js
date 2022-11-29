const config = require('config');

const { getChildLogger } = require('../core/logging');
const ServiceError = require('../core/serviceError');
const giftRepository = require('../repository/gift');

const DEFAULT_PAGINATION_OFFSET = config.get('pagination.offset');

const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getChildLogger('gift-service');
  this.logger.debug(message, meta);
};

/**
 * Get all gifts to a user by a given `user_id`.
 */
const getAllGiftsByUserId = async (limit = 5, offset = DEFAULT_PAGINATION_OFFSET, user_id) => {
  debugLog('Fetching all gifts', {user_id});
  const data =  await giftRepository.findAllByUserId(user_id, {limit, offset});
  const count = await giftRepository.findCount(user_id);
  return {data, count, limit, offset};
};

/**
 * Get a gift with the given `id`.
 *
 * @param {number} id - Id of the gift to find.
 */
const getById = async (id) => {
  debugLog(`Fetching gift with id ${id}`);
  const gift = await giftRepository.findById(id);

  if(!gift) {
    throw ServiceError.notFound(`Gift with id ${id} not found`, {id});
  }

  return gift;
};

/**
 * Create a new gift with the given `gift`,`restaurant_id` and `user_id`.
 *
 * @param {object} gift - Gift to create.
 * @param {string} [gift.gift] - Gift of the gift.
 * @param {string} [gift.restaurant_id] - Restaurant linked to the gift.
 * @param {number} [gift.user_id] - User linked to the gift.
 */
const create = async ({name, comments, url, user_id}) => {
  const newGift = {name, comments, url, user_id};
  debugLog('Creating new gift', newGift);
  return giftRepository.create(newGift);
};

/**
 * Update an existing gift with the given `gift`,`restaurant_id` and `user_id`.
 *
 * @param {number} id - Id of the gift to update.
 * @param {object} gift - Gift to update.
 * @param {string} [gift.gift] - Gift of the gift.
 * @param {string} [gift.restaurant_id] - Restaurant linked to the gift.
 * @param {number} [gift.user_id] - User linked to the gift.
 */
const updateById = async (id, {isReserved, reservedBy}) => {
  const updatedGift = {isReserved, reservedBy};
  debugLog(`Updating gift with id ${id}`, updatedGift);
  return await giftRepository.updateById(id, updatedGift);
};

/**
 * Delete a gift.
 *
 * @param {number} id - Id of the gift to delete.
 *
 * @returns {Promise<boolean>} Whether the gift was deleted.
 */
const deleteById = async (id) => {
  debugLog(`Deleting gift with id ${id}`);
  await giftRepository.deleteById(id);
};

module.exports = {
  getAllGiftsByUserId,
  getById,
  create,
  updateById,
  deleteById,
};