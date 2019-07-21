import {default as commander} from 'commander';
import {default as http} from 'http';

import {readFile} from './fs';
import {openOrCreatePems, authorize} from './utils';

commander.option('-c, --configuration [path]', 'path of the configuration file').parse(process.argv);

let _conf;
let _pems;

let server = new http.Server();

server.on('request', (request, response) => {
  try {
    let verb = request.headers['x-original-method'];
    let path = request.headers['x-original-uri'];
    let token = request.headers.authorization.split(' ')[1];

    authorize(_conf, _pems, token, path, verb).then(result => {
      if (result.authorized) {
        response.statusCode = 200;
        response.setHeader("x-id", result.id);
        response.setHeader("x-groups", result.groups.join(','));
      } else {
        response.statusCode = 403;
      }

      console.log(`${(new Date()).toISOString()}\t${response.statusCode}\t${verb}\t${path}`);
      response.end();
    }).catch(err => {
      console.dir(err);
      response.statusCode = 500;
      response.end();
    });
  } catch (error) {
    console.dir(error);
    response.statusCode = 500;
    response.end();
  }
});

readFile(commander.configuration).then(data => {
  _conf = JSON.parse(data);

  return openOrCreatePems(_conf.pemsPath, _conf.keyUrl);
}).then(pems => {
  _pems = pems;
  server.listen(8888);
}).catch(error => {
  console.log(error);
});
