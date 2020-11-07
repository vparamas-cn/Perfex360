FROM mysql:5.7

ENV MYSQL_DATABASE=db_perfex \
    MYSQL_ROOT_PASSWORD=password

COPY ./db_perfex_user_tbl.sql /docker-entrypoint-initdb.d/