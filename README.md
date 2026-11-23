# Ludio

Aplicación web construida con Next.js, Prisma 7, Auth.js y PostgreSQL.

## Requisitos previos

- Node.js 22+ y npm
- Docker y Docker Compose

## Configuración inicial

1. Copia la plantilla de variables de entorno y completa tus credenciales:

```bash
cp .env.example .env
```

Variables principales en `.env`:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`
- `AUTH_SECRET` (en producción genera uno aleatorio con `openssl rand -base64 32`)
- `IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET` (credenciales de Twitch/IGDB para búsqueda de juegos)

---

## Desarrollo local (PostgreSQL en Docker + Next.js en local)

1. Levanta solo la base de datos:

```bash
docker compose -f docker-compose.local.yml up -d
```

2. Instala dependencias (ejecuta `prisma generate` automáticamente mediante `postinstall`):

```bash
npm install
```

3. Aplica las migraciones de base de datos:

```bash
npm run db:migrate
```

4. Arranca el servidor de desarrollo:

```bash
npm run dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Producción con Docker

El archivo `docker-compose.yml` orquesta tres servicios:
1. **`db`**: PostgreSQL 15 con `healthcheck`.
2. **`ludio-init`**: Contenedor de inicialización que espera a que `db` esté sano y ejecuta `npx prisma migrate deploy`.
3. **`app`**: Servidor Next.js (`output: "standalone"`) que arranca automáticamente cuando `ludio-init` finaliza con éxito, persistiendo las imágenes subidas en el volumen `ludio_uploads`.

Para construir y levantar todo el stack en producción:

```bash
docker compose up -d --build
```

La app en producción estará disponible en [http://localhost:5020](http://localhost:5020).

Para ver los logs de inicialización o de la aplicación:

```bash
docker compose logs -f ludio-init app
```
