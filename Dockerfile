FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
COPY --chown=node:node package.json server.cjs ./
COPY --chown=node:node payments ./payments
COPY --chown=node:node dist ./dist
USER node
EXPOSE 8080
CMD ["node", "server.cjs"]
