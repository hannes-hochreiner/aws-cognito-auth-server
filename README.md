![CI](https://github.com/hannes-hochreiner/aws-cognito-auth-server/workflows/CI/badge.svg)
# AWS Cognito authorization server

## Expected headers
The names of the expected headers can be configured.
```
Authorization: Bearer XXXX
X-Original-URI: XXXX
X-Original-METHOD: XXXX
```

## Provided Headers
```
x-id: <user sub>
x-groups: <comma separated group-ids>
```

## Configuration file
In the Docker container, the configuration file is expected at "/var/aws-cognito-auth-server/config.json".
It can be configured by modifying the command parameter "-c".
The default values for the header names are the ones shown in the example.
```JSON
{
  "iss": "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_XXXXXX",
  "keyUrl": "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_XXXXXX/.well-known/jwks.json",
  "pemsPath": "pems.json",
  "headerNames": {
    "method": "x-forwarded-method",
    "uri": "x-forwarded-uri",
    "id": "x-id",
    "groups": "x-groups"
  },
  "auth": {
    "/": {
      "GET": ["group1"]
    },
    "/test/test2": {
      "GET": ["group1", "group2"]
    },
    "/test/test2/test3": {
      "GET": ["group3"]
    }
  }
}
```

## nginx configuration
```
http {
    ...
    server {
    ...
        location /couchdb/ {
            auth_request     /auth;
            auth_request_set $auth_user $upstream_http_x_id;
            auth_request_set $auth_groups $upstream_http_x_groups;
            proxy_set_header X-Auth-CouchDB-UserName $auth_user;
            proxy_set_header X-Auth-CouchDB-Roles $auth_groups;
            proxy_pass         http://couchdb:5984;
            proxy_redirect     off;
            proxy_set_header   Host $host;
        }

        location = /auth {
            internal;
            proxy_pass              http://localhost:8888;
            proxy_pass_request_body off;
            proxy_set_header        Content-Length "";
            proxy_set_header        X-Original-URI $request_uri;
            proxy_set_header        X-Original-METHOD $request_method;
        }
    }
}
```

## References
  * [Integrating Cognito with API gateway](https://aws.amazon.com/blogs/mobile/integrating-amazon-cognito-user-pools-with-api-gateway/)
  * [Using tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html)
  * [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
  * [jwk-to-pem](https://www.npmjs.com/package/jwk-to-pem)
