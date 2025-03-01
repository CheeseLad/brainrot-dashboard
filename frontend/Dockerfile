FROM node:20.11.1-alpine3.19 AS build

WORKDIR /app

COPY package.json ./

RUN npm install

ENV PATH /app/node_modules/.bin:$PATH

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .

RUN npm run build

FROM nginx:1.25.4-alpine3.18

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/html/

EXPOSE 5173

ENTRYPOINT ["nginx","-g","daemon off;"]