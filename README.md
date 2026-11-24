# Flux

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

3. Aplica las migraciones y ejecuta el seed inicial (tiendas por defecto y usuario administrador de `.env`):

```bash
npm run db:migrate
npm run db:seed
```

4. Arranca el servidor de desarrollo:

```bash
npm run dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Producción con Docker

Flux **no levanta su propia base de datos PostgreSQL** en producción: se conecta a la instancia PostgreSQL compartida (`db_postgres:5432`) a través de la red Docker externa `dab_db`, usando `DATABASE_URL` desde `.env`.

El archivo `docker-compose.yml` orquesta dos servicios:
1. **`flux-init`**: Contenedor de inicialización que aplica las migraciones y el seed contra `DATABASE_URL` (`npx prisma migrate deploy && npm run db:seed`).
2. **`app`** (`flux_app`): Servidor Next.js (`output: "standalone"`) que arranca automáticamente cuando `flux-init` finaliza con éxito, persistiendo las imágenes subidas en el volumen `flux_uploads`.

Para construir y levantar el stack en producción:

```bash
docker compose up -d --build
```

### Puertos públicos en producción
- **`5020`**: Aplicación web principal ([http://localhost:5020](http://localhost:5020)).
- **`5022`**: Prisma Studio (`npm run db:studio` abre en [http://localhost:5022](http://localhost:5022)).

Para ver los logs de inicialización o de la aplicación:

```bash
docker compose logs -f flux-init app
```
