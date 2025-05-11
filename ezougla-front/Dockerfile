FROM node:18-alpine

WORKDIR /app
CMD ["mkdir", "ezougla-front"]
CMD ["cd", "ezougla-front"]

COPY . .

RUN npm i
RUN npm install -g @angular/cli


CMD ["ng","serve"]
