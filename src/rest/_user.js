const Joi = require('joi');
const Router =  require('@koa/router');

const userService = require('../service/user');
const Role = require('../core/roles');
const {requireAuthentication, makeRequireRole} = require('../core/auth');

const validate = require('./_validation');

/**
 * 
 * @swagger
 * tags:
 *   name: Users
 *   description: Represents a user that has registered for this application.
 * components:
 *   schemas:
 *     User:
 *       allOf:
 *         - $ref: "#/components/schemas/Base"
 *         - type: object
 *           required:
 *             - firstName
 *             - lastName
 *             - email
 *           properties:
 *             firstName:
 *               type: "string"
 *             lastName:
 *               type: "string"
 *             email:
 *               type: "string"
 *               format: email
 *           example:
 *             $ref: "#/components/examples/User"
 *     UsersList:
 *       allOf:
 *         - $ref: "#/components/schemas/ListResponse"
 *         - type: object
 *           required:
 *            - data
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *   examples:
 *     User:
 *       id: "c5654c8a-9952-428a-bf8c-e075eecddf8b"
 *       firstName: "Admin"
 *       lastName: "User"
 *       email: "admin.user@hogent.be"
 * 
 *   requestBodies:
 *     User:
 *       description: The user info to save
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: "string"
 *                 example: "Admin"
 *               lastName:
 *                 type: "string"
 *                 example: "User"
 *               email:
 *                 type: "string"
 *                 format: email
 *                 example: "admin.user@hogent.be"
 * 
 */

const login = async (ctx) => {
  const { email, password } = ctx.request.body;
  const session = await userService.login(email, password);
  ctx.body = session;
};
login.validationScheme = {
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  },
};

/**
 * 
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user.
 *     tags:
 *       - Users
 *     requestBody:
 *       $ref: "#/components/requestBodies/User"
 *     responses:
 *       201:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 */
const register = async (ctx) => {
  const session = await userService.register(ctx.request.body);
  ctx.body = session;
};
register.validationScheme = {
  body: {
    firstName: Joi.string().max(255).required(),
    lastName: Joi.string().max(255).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30),
  },
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     parameters:
 *       - $ref: "#/components/parameters/limitParam"
 *       - $ref: "#/components/parameters/offsetParam"
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UsersList"
 *     tags:
 *     - Users
 */

const getAllUsers = async (ctx) => {
  const limit = ctx.query.limit && Number(ctx.query.limit);
  const offset = ctx.query.limit && Number(ctx.query.offset);
  const users = await userService.getAll(limit, offset, ctx.state.session.userId);
  ctx.body = users;
};
getAllUsers.validationScheme = {
  query: Joi.object({
    limit: Joi.number().integer().positive().max(1000).optional(),
    offset: Joi.number().integer().min(0).optional(),
    user_id: Joi.string().uuid(),
  }).and('limit', 'offset'),
};

/**
 * 
 * @swagger
 * /api/users/{id}:
 *  get:
 *    summary: Get a user by id
 *    description: Get a user by id
 *    parameters:
 *      - $ref: "#/components/parameters/idParam"
 *    responses:
 *      200:
 *        description: The retrieved user by id
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/User"
 *    tags:
 *    - Users
 */
const getUserById = async (ctx) => {
  const user = await userService.getById(ctx.params.id);
  ctx.body = user;
};
getUserById.validationScheme = {
  params: {
    id: Joi.string().uuid(),
  },
};

/**
 * 
 * @swagger
 * /api/users/{id}:
 *  put:
 *    summary: Update a user by id
 *    description: Update a user by id
 *    parameters:
 *      - $ref: "#/components/parameters/idParam"
 *    responses:
 *      200:
 *        description: The retrieved user by id
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/User"
 *    tags:
 *    - Users
 */

const updateUserById = async (ctx) => {
  const user = await userService.updateById(ctx.params.id, ctx.request.body);
  ctx.body = user;
};
updateUserById.validationScheme = {
  params: {
    id: Joi.string().uuid(),
  },
  body: {
    firstName: Joi.string().max(255),
    lastName: Joi.string().max(255),
    email: Joi.string().email(),
  },
};

/**
 * 
 * @swagger
 * /api/users/{id}:
 *  delete:
 *    summary: Delete a user by id
 *    description: Delete a user by id
 *    parameters:
 *      - $ref: "#/components/parameters/idParam"
 *    responses:
 *      204:
 *        description: The user has been deleted by id.
 *        content:
 *          text/plain:
 *            schema:
 *              type: integer
 *              example: 1
 *    tags:
 *    - Users
 */
const deleteUserById = async (ctx) => {
  await userService.deleteById(ctx.params.id);
  ctx.status = 204;
};
deleteUserById.validationScheme = {
  params: {
    id: Joi.string().uuid(),
  },
};

/**
 * Install user routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installUsersRoutes(app) {
  const router = new Router({
    prefix: '/users',
  });

  // Public routes
  router.post('/register', register);
  router.post('/login', login);

  // const requireAdmin = makeRequireRole(Role.ADMIN);

  router.get('/', requireAuthentication, getAllUsers);
  router.get('/:id', validate(getUserById.validationScheme), requireAuthentication, getUserById);
  router.put('/:id', validate(updateUserById.validationScheme), requireAuthentication, updateUserById);
  router.delete('/:id', validate(deleteUserById.validationScheme), requireAuthentication, deleteUserById);

  app.use(router.routes()).use(router.allowedMethods());
};