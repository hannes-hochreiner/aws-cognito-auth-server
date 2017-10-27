import {default as fs} from 'fs';

export function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(data);
    });
  });
}

export function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, 'utf8', error => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
