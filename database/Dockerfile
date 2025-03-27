FROM postgres:14-alpine

COPY schema.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_PASSWORD=123456789
ENV POSTGRES_DB=postgres
ENV POSTGRES_USER=postgres 