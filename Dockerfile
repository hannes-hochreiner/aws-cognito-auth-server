FROM node:lts-alpine
RUN mkdir -p /opt/aws-cognito-auth-server
COPY src /opt/aws-cognito-auth-server/src
COPY package.json /opt/aws-cognito-auth-server/package.json
RUN cd /opt/aws-cognito-auth-server && npm install && npm run build

FROM node:lts-alpine
MAINTAINER Hannes Hochreiner <hannes@hochreiner.net>
COPY --from=0 /opt/aws-cognito-auth-server/bld /opt/aws-cognito-auth-server
COPY --from=0 /opt/aws-cognito-auth-server/package*.json /opt/aws-cognito-auth-server/
RUN cd /opt/aws-cognito-auth-server && npm install --production
EXPOSE 8888
VOLUME /var/aws-cognito-auth-server/config.json
CMD ["node", "/opt/aws-cognito-auth-server/main", "-c", "/var/aws-cognito-auth-server/config.json"]
