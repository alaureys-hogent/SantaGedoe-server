module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SantaGedoe API with Swagger',
      version: '0.1.0',
      description: 'This is a simple CRUD API application made wit Koa Swagger',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      contact: {
        name: 'SantaGedoe',
        email: 'arnaud.laureys@student.hogent.be',
      },
    },
    servers: [{
      url: 'http://localhost:9000/',
    }],
  },
  apis: ['./src/rest/*.js'],
};