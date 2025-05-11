FROM node:18-alpine

WORKDIR /app
CMD ["cd", "ezougla-back"]

CMD ["npm", "test"]

CMD ["cd", ".."]

CMD ["cd", "ezougla-front"]

CMD ["ng", "test"]
