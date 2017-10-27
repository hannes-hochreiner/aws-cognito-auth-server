import {readFile} from './fs';
import {openOrCreatePems, authorize} from './utils';
import {default as commander} from 'commander';
import {default as express} from 'express';

commander.option('-c, --configuration [path]', 'path of the configuration file').parse(process.argv);

let _conf;
let _pems;
let _app = express();

_app.get('/', function (req, res) {
  let path = req.get('X-Original-URI');
  let token = req.get('Authorization').split(' ')[1];
  let verb = req.get('X-Original-METHOD');

  authorize(_conf, _pems, token, path, verb).then(result => {
    if (result) {
      res.sendStatus(200);
      return;
    }

    res.sendStatus(403);
  }).catch(err => {
    res.sendStatus(500);
  });
})

readFile(commander.configuration).then(data => {
  _conf = JSON.parse(data);

  return openOrCreatePems(_conf.pemsPath, _conf.keyUrl);
}).then(pems => {
  _pems = pems;
  _app.listen(8888);
}).catch(error => {
  console.log(error);
});
