FROM node:14.15.0-slim

# Work directory
WORKDIR /app

# Create directories using user "node"
RUN mkdir -p /app/node_modules && chown -R node:node /app
RUN mkdir -p /etc/logs && chown -R node:node /etc/logs

COPY ["./package*.json","yarn.lock",".env","./"]

RUN yarn install
RUN yarn global add typescript@3.9.7

COPY --chown=node:node . .

# Build typescript
RUN sh -c tsc

# Set to production
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

RUN npm prune --production

USER node
ENTRYPOINT ["node", "."]