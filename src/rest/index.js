const Router = require('@koa/router');

const installUserRouter = require('./_user');
const installGiftRouter = require('./_gift');

/**
 * 
 * @swagger
 * components:
 *   schemas:
 *     Base:
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: "string"
 *       example:
 *         id: "6d560fca-e7f9-4583-af2d-b05ccd1a0c58"
 *     ListResponse:
 *       required:
 *         - count
 *         - limit
 *         - offset
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of items returned
 *           example:
 *         limit:
 *           type: integer
 *           description: Limit actually used
 *           example: 1
 *         offset:
 *           type: integer
 *           description: Offset actually used
 *           example: 1
 *   responses:
 *     404NotFound:
 *       description: The requested resource could not be found.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - details
 *             properties:
 *               code:
 *                 type: string
 *               details:
 *                 type: string
 *                 description: Extra information about the specific not found error that occured
 *               stack:
 *                 type: string
 *                 description: Stack trace (only available configuration)
 *               example:
 *                 code: "NOT_FOUND"
 *                 details: "No user with the id c5654c8a-9952-428a-bf8c-e075eecddf8b exists"
 *  
 *   parameters:
 *     limitParam:
 *       in: query
 *       name: limit
 *       description: Maximum amount of items to return
 *       required: false
 *       schema:
 *         type: integer
 *         default: 100
 *     offsetParam:
 *       in: query
 *       name: offset
 *       description: Number of items to skip
 *       required: false
 *       schema:
 *         type: integer
 *         default: 0
 *     idParam:
 *       in: query
 *       name: id
 *       description: The id of the record.
 *       required: false
 *       schema:
 *         type: "string" 
 */

/**
 * Install all routes in the given Koa application.
 *
 * @param {Koa} app - The Koa application.
 */
module.exports = (app) => {

  const router = new Router({
    prefix: '/api',
  });

  installUserRouter(router);
  installGiftRouter(router);

  app.use(router.routes()).use(router.allowedMethods());
};