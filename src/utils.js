import {readFile, writeFile} from './fs';
import {getPems} from './awsUtils';
import {validateToken} from './awsUtils';

export function openOrCreatePems(pemsPath, keyUrl) {
  return readFile(pemsPath).then(data => {
    return JSON.parse(data);
  }).catch(error => {
    if (error.code !== 'ENOENT') {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }

    return getPems(keyUrl).then(pems => {
      return writeFile(pemsPath, JSON.stringify(pems)).then(() => {
        return pems;
      });
    });
  });
}

function _sortDescendingByLength(elem1, elem2) {
  if (elem1.length > elem2.length) {
    return -1;
  }

  if (elem1.length < elem2.length) {
    return 1;
  }

  return 0;
}

export function authorize(conf, pems, token, path, verb) {
  return validateToken(pems, token, conf.iss).then(id => {
    let res = { authorized: false };

    if (!conf.auth) {
      return res;
    }

    let paths = Object.keys(conf.auth).filter(elem => {
      return path.startsWith(elem);
    });

    if (paths.length == 0) {
      return res;
    }

    let relevantPath = paths.sort(_sortDescendingByLength)[0];

    if (!conf.auth[relevantPath][verb.toUpperCase()]) {
      return res;
    }

    let checkVals = [id.sub].concat(id['cognito:groups']);
    let someFun = checkVals.includes.bind(checkVals);

    if (conf.auth[relevantPath][verb.toUpperCase()].some(someFun)) {
      res.authorized = true;
      res.id = id.sub;
      res.groups = id['cognito:groups'];
    }

    return res;
  });
}
