import {default as jwkToPem} from 'jwk-to-pem';
import {default as jwt} from 'jsonwebtoken';
import {httpRequest} from './httpRequest';

export function getPems(keyUrl) {
  return httpRequest(keyUrl).then(data => {
    let pems = {};

    data = JSON.parse(data);

    data.keys.forEach(key => {
      pems[key.kid] = jwkToPem({
        kty: key.kty,
        n: key.n,
        e: key.e
      });
    });

    return pems;
  });
}

// modified from https://aws.amazon.com/blogs/mobile/integrating-amazon-cognito-user-pools-with-api-gateway/
export function validateToken(pems, token, iss) {
  return new Promise((resolve, reject) => {
    //Fail if the token is not jwt
    var decodedJwt = jwt.decode(token, {complete: true});

    if (!decodedJwt) {
      reject(new Error('Not a valid JWT token'));
      return;
    }

    //Fail if token is not from your User Pool
    if (decodedJwt.payload.iss != iss) {
      reject(new Error('Invalid issuer'));
      return;
    }

    //Reject the jwt if it's not an 'Id Token'
    if (decodedJwt.payload.token_use != 'id') {
      reject(new Error('Not an access token'));
      return;
    }

    //Get the kid from the token and retrieve corresponding PEM
    var kid = decodedJwt.header.kid;
    var pem = pems[kid];
    if (!pem) {
      reject(new Error('Invalid access token'));
      return;
    }

    //Verify the signature of the JWT token to ensure it's really coming from your User Pool
    jwt.verify(token, pem, { issuer: iss }, function(err, payload) {
      if(err) {
        reject(err);
        return;
      }
      //Valid token. Generate the API Gateway policy for the user
      //Always generate the policy on value of 'sub' claim and not for 'username' because username is reassignable
      //sub is UUID for a user which is never reassigned to another user.
      resolve(payload);
    });
  });
};
