import dayjs from 'dayjs';

import { decode, handleDecode, decodeAndFormatCorpus } from './setSearchQuery';

const formatQuery = (queries) => {
  if (queries === null) return null;
  const finalQuery = new Array(queries.length);
  queries.forEach((query, i) => {
    const decoded = handleDecode([query]);
    decoded[0] = decoded[0] === '' ? [] : decoded[0];
    finalQuery[i] = decoded;
  });
  const flattenedQuery = [].concat(...finalQuery);
  return flattenedQuery;
};

const sizeQuery = (queryArray) => {
  if (!queryArray) return [[], [], []];

  if (queryArray.length >= 3) return queryArray;
  if (queryArray.length === 2) {
    queryArray.push([]);
  }
  if (queryArray.length === 1) {
    queryArray.push([], []);
  }
  return queryArray;
};

const handleDateFormat = (dateString) => (
  dayjs(dateString, 'MM/DD/YYYY').format('MM/DD/YYYY')
);

const decodeSavedSearch = (url) => {
  const [, fullquery] = url.split('?');
  const parameter = url.split('?')[1].split('=')[0];
  const advanced = parameter === 'qs';

  let query = fullquery.split('&')[0].split('=')[1];
  query = decode(query);
  console.log('decode query', query);
  query = query ? query.split(',') : null;

  query = formatQuery(query);

  query = query ? sizeQuery(query) : null;

  let negatedQuery = fullquery.split('=')[2].split('&')[0];

  negatedQuery = decode(negatedQuery);
  negatedQuery = negatedQuery ? negatedQuery.split(',') : [[], [], []];

  negatedQuery = formatQuery(negatedQuery);

  negatedQuery = negatedQuery ? sizeQuery(negatedQuery) : null;

  let start = fullquery.split('=')[3].split('&')[0];
  start = start ? handleDecode(start) : null;

  console.log(start, 'start decode');
  start = handleDateFormat(start);

  let end = fullquery.split('=')[4].split('&')[0];
  end = end ? handleDecode(end) : null;

  end = handleDateFormat(end);

  const platforms = fullquery.split('=')[5].split('&')[0];

  let sources = fullquery.split('=')[6].split('&')[0];

  sources = decode(sources);

  sources = sources ? sources.split(',') : [];
  sources = decodeAndFormatCorpus(sources, false);

  let collections = fullquery.split('=')[7].split('&')[0];

  collections = decode(collections);

  collections = collections ? collections.split(',') : [];

  collections = decodeAndFormatCorpus(collections, true);

  const anyAlls = fullquery.split('=')[8].split('&')[0];

  // queries,
  // negatedQueries,
  // queryStrings,
  // startDates,
  // endDates,
  // platforms,
  // media,
  // anyAlls,

  return {
    queryString: '',
    queryList: query,
    negatedQueryList: negatedQuery,
    platform: platforms,
    startDate: start,
    endDate: end,
    collections,
    previewCollections: collections,
    sources,
    previewSources: sources,
    anyAll: anyAlls,
    advanced,
  };
};

export default decodeSavedSearch;
