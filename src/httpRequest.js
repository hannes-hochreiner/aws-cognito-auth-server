import { default as urlModule } from 'url';
import { default as http } from 'http';
import { default as https } from 'https';

export function httpForward(url, stream) {
  return new Promise((resolve, reject) => {
    let urlObj = new urlModule.parse(url);
    let req;

    if (urlObj.protocol === 'http:') {
      req = http;
    } else if (urlObj.protocol === 'https:') {
      req = https;
    } else {
      reject(new Error(`Unknown protocol ${urlObj.protocol}`));
      return;
    }

    req.get(url, (res) => {
      const { statusCode } = res;
      let error;

      if (statusCode !== 200) {
        error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
      }

      if (error) {
        // consume response data to free up memory
        res.resume();
        reject(error);
        return;
      }

      stream.append('content-length', res.headers['content-length']);

      res.on('data', (chunk) => {
        stream.write(chunk);
      });
      res.on('end', () => {
        stream.end();
        resolve();
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

export function httpRequest(url) {
  return new Promise((resolve, reject) => {
    let urlObj = new urlModule.parse(url);
    let req;

    if (urlObj.protocol === 'http:') {
      req = http;
    } else if (urlObj.protocol === 'https:') {
      req = https;
    } else {
      reject(new Error(`Unknown protocol ${urlObj.protocol}`));
      return;
    }

    req.get(url, (res) => {
      const { statusCode } = res;
      let error;

      if (statusCode !== 200) {
        error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
      }

      if (error) {
        // consume response data to free up memory
        res.resume();
        reject(error);
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        resolve(rawData);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}
