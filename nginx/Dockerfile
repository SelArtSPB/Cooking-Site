FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Создаем директорию для загруженных файлов
RUN mkdir -p /uploads && chmod 755 /uploads

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 