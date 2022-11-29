const Joi = require('joi');
const Router =  require('@koa/router');

const giftService = require('../service/gift');
// const { requireAuthentication } = require('../core/auth');

// const validate = require('./_validation.js');

/**
 * 
 * @swagger
 * tags:
 *   name: Gifts
 *   description: Represents a gift that was issued to a restaurant by a registered user.
 * components:
 *   schemas:
 *     Gift:
 *       allOf:
 *         - $ref: "#/components/schemas/Base"
 *         - type: object
 *           required:
 *             - gift
 *             - restaurant_id
 *             - user_id
 *           properties:
 *             gift:
 *               type: integer
 *             restaurant_id:
 *               $ref: "#/components/schemas/Restaurant"
 *             user_id:
 *               $ref: "#/components/schemas/User"
 *           example:
 *             $ref: "#/components/examples/Gift"
 *     GiftsList:
 *       allOf:
 *         - $ref: "#/components/schemas/ListResponse"
 *         - type: object
 *           required:
 *            - data
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Gift"
 *   examples:
 *     Gift:
 *       id: "16de6a16-8d68-4b80-a5de-6dc150677c0a"
 *       score: 5
 *       restaurant_id:
 *         $ref: "#/components/examples/Restaurant"
 *       user_id:
 *         $ref: "#/components/examples/User"
 *   requestBodies:
 *     Gift:
 *       description: The score info to save.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: integer
 *                 example: 5
 *               restaurant_id:
 *                 $ref: "#/components/schemas/Restaurant"
 *               user_id:
 *                 $ref: "#/components/schemas/User"
 *       
 */

/**
 * @swagger
 * /api/scores/{user_id}:
 *   get:
 *     summary: Get all scores from a user.
 *     parameters:
 *       - $ref: "#/components/parameters/limitParam"
 *       - $ref: "#/components/parameters/offsetParam"
 *       - $ref: "#/components/parameters/idParam"
 *     responses:
 *       200:
 *         description: List of scores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GiftsList"
 *     tags:
 *     - Gifts
 */

const getAllGiftsByUserId = async (ctx) => {
  const limit = ctx.query.limit && Number(ctx.query.limit);
  const offset = ctx.query.limit && Number(ctx.query.offset);
  ctx.body = await giftService.getAllGiftsByUserId(limit, offset, ctx.params.user_id);
};
getAllGiftsByUserId.validationScheme = {
  query: Joi.object({
    limit: Joi.number().integer().positive().max(1000).optional(),
    offset: Joi.number().integer().min(0).optional(),
  }).and('limit', 'offset'),
};

/**
 * 
 * @swagger
 * /api/scores:
 *   post:
 *     summary: Create a new score
 *     description: Creates a new score.
 *     tags:
 *       - Gifts
 *     requestBody:
 *       $ref: "#/components/requestBodies/Gift"
 *     responses:
 *       201:
 *         description: The created score
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Gift"
 */
const createGift = async (ctx) => {
  const newGift = await giftService.create({
    ...ctx.request.body,
  });
  console.debug('newGift', newGift);
  ctx.body = newGift;
  ctx.status = 201;
};
createGift.validationScheme = {
  body: {
    name: Joi.string().required(),
    user_id: Joi.string().uuid(),
  },
};

/**
 * 
 * @swagger
 * /api/scores/{id}:
 *  get:
 *    summary: Get a score by id
 *    description: Get a score by id
 *    parameters:
 *      - $ref: "#/components/parameters/idParam"
 *    responses:
 *      200:
 *        description: The retrieved score by id
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Gift"
 *    tags:
 *    - Gifts
 */
const getGiftById = async (ctx) => {
  ctx.body = await giftService.getById(ctx.params.id);
};
getGiftById.validationScheme = {
  params: {
    id: Joi.string().uuid(),
  },
};

/**
 * 
 * @swagger
 * /api/scores/{id}:
 *  put:
 *    summary: Update a score by id
 *    description: Update a score by id
 *    parameters:
 *      - $ref: "#/components/parameters/idParam"
 *    responses:
 *      200:
 *        description: The retrieved score by id
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Gift"
 *    tags:
 *    - Gifts
 */
const updateGift = async (ctx) => {
  ctx.body = await giftService.updateById(ctx.params.id, ctx.request.body);
};
updateGift.validationScheme = {
  params: {
    id: Joi.string().uuid(),
  },
};

/**
 * 
 * @swagger
 * /api/scores/{id}:
 *  delete:
 *    summary: Delete a score by id
 *    description: Delete a score by id
 *    parameters:
 *      - $ref: "#/components/parameters/idParam"
 *    responses:
 *      204:
 *        description: The score has been deleted by id.
 *        content:
 *          text/plain:
 *            schema:
 *              type: integer
 *              example: 1
 *    tags:
 *    - Gifts
 */
const deleteGift = async (ctx) => {
  ctx.body = await giftService.deleteById(ctx.params.id);
  ctx.status = 204;
};
deleteGift.validationScheme = {
  params: {
    id: Joi.string().uuid(),
  },
};

module.exports = (app) => {
  const router = new Router({
    prefix: '/gifts',
  });

  router.get('/:user_id', getAllGiftsByUserId);
  router.post('/', createGift);
  router.get('/gift/:id', getGiftById);
  router.put('/gift/:id', updateGift);
  router.delete('/gift/:id', deleteGift);

  // router.get('/:user_id', validate(getAllGiftsByUserId.validationScheme), requireAuthentication, getAllGiftsByUserId);
  // router.post('/',validate(createGift.validationScheme), requireAuthentication, createGift);
  // router.get('/s/:id', validate(getGiftById.validationScheme), requireAuthentication, getGiftById);
  // router.put('/s/:id', validate(updateGift.validationScheme), requireAuthentication, updateGift);
  // router.delete('/s/:id', validate(deleteGift.validationScheme), requireAuthentication, deleteGift);

  app.use(router.routes()).use(router.allowedMethods());
};