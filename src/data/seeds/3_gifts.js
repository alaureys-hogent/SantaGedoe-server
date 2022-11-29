const { tables } = require('..');

module.exports = {
  seed: async (knex) => {
    // first delete all entries
    await knex(tables.gift).delete();

    await knex(tables.gift).insert([
      {
        id: '16de6a16-8d68-4b80-a5de-6dc150677c0a',
        name: 'Tommy Hilfinger Kousen',
        url: 'https://www.bol.com/nl/nl/p/tommy-hilfiger-sokken-verrassingsdeal-12-paar/9300000082465258/?bltgh=sV4St0rsyEQYROjFsapB2A.2_18.48.ProductTitle',
        comments: 'Maat 43-46',
        isReserved: false,
        reservedBy: null,
        isReceived: false,
        user_id: 'c5654c8a-9952-428a-bf8c-e075eecddf8b',
      },
      {
        id: '8d6f9a5c-e12f-42c5-9fd2-dc6dd390399e',
        name: 'Gridlifter - Big Green Egg',
        url: 'https://www.bbqexperiencecenter.be/nl/product/cast-iron-grid-lifter-2/',
        comments: 'Mag natuurlijk ook een ander merk zijn. en tweedehands',
        isReserved: true,
        reservedBy: 'Julie De Muynck',
        isReceived: true,
        user_id: 'c5654c8a-9952-428a-bf8c-e075eecddf8b',
      },
      {
        id: '28140415-91ee-4afa-bf7a-92db044a8460',
        name: 'Broodrooster',
        url: 'https://www.amazon.nl/dp/B09GMHQ7RM/ref=asc_df_B09GMHQ7RM1667977200000/?creative=380333&creativeASIN=B09GMHQ7RM&linkCode=asn&tag=beslistnl20-21&ascsubtag=ac2292af-55be-41ae-b930-f2f5fd6e7eae#customerReviews',
        comments: 'zwart of chrome; met lange sleuven (heel belangrijk!)',
        isReserved: true,
        reservedBy: 'Cédric Laureys',
        isReceived: false,
        user_id: 'c5654c8a-9952-428a-bf8c-e075eecddf8b',
      },
    ]);
  },
};