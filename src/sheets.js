const request = require('superagent');

const TOO_MANY_RECORDS_ERROR = `
Sorry! That payload is a bit too large. Please restrict each request to less
than 100 records. You can try batching each update like below:

----------------------------------------------------------------------------
  const {chunk} = require('lodash')

  const main = async () => {
    const records = await fetchLargeDataset();
    const token = await Taro.sheets.load('My Large Dataset');
    const batches = chunk(records, 100);

    return batches.reduce((pr, batch) => {
      return pr
        .then(() => Taro.sheets.update(token, batch))
        .then(() => console.log('Sleeping for 1s...'))
        .then(() => Taro.sleep(500));
    }, Promise.resolve());
  };
----------------------------------------------------------------------------
`;

const retrieve = async (auth, id) => {
  const res = await request
    .get(`https://www.gettaro.com/api/google/sheets/${id}`)
    .set('Authorization', `Bearer ${auth}`);

  return res.body;
};

const search = async (auth, name) => {
  const res = await request
    .get(`https://www.gettaro.com/api/google/sheets/search`)
    .set('Authorization', `Bearer ${auth}`)
    .query({name});

  return res.body.data;
};

const create = async (auth, title = 'Demo Sheet') => {
  const res = await request
    .post('https://www.gettaro.com/api/google/sheets')
    .set('Authorization', `Bearer ${auth}`)
    .send({title});

  return res.body.data;
};

const append = async (auth, id, records = []) => {
  // TODO: look into this
  if (records.length > 100) {
    return Promise.reject(TOO_MANY_RECORDS_ERROR);
  }

  const res = await request
    .put(`https://www.gettaro.com/api/google/sheets/${id}`)
    .set('Authorization', `Bearer ${auth}`)
    .send({records});

  return res.body;
};

const load = async (auth, title = 'HN Posts') => {
  const existing = await search(auth, title);

  if (existing) {
    return existing.spreadsheet_id;
  }

  const created = await create(auth, title);

  return created.spreadsheet_id;
};

const update = async (auth, id, records, options = {}) => {
  const {uniqBy = []} = options;

  if (!records || records.length === 0) {
    return null;
  }

  if (uniqBy.length === 0) {
    await append(auth, id, records);

    return {ok: true};
  }

  const {data: original} = await retrieve(auth, id);
  const sets = uniqBy.reduce((acc, field) => {
    return {
      ...acc,
      [field]: new Set(original.map((r) => r[field])),
    };
  }, {});
  const updates = records.filter((r) => {
    return Object.keys(sets).every((field) => {
      const set = sets[field];
      const val = r[field];

      return !set.has(val);
    });
  });

  if (updates.length > 0) {
    await append(auth, id, updates);
  }

  return {ok: true};
};

module.exports = {
  load,
  retrieve,
  append,
  update,
};
