# Docker Development Setup

This setup runs the project with:

- `client` on `http://localhost:3000`
- `backend` on `http://localhost:5000`
- `mongo` on `mongodb://localhost:27017/robobooks`

The containers are configured for development:

- source code is bind-mounted into the containers
- `nodemon` restarts the backend automatically
- Next.js runs in dev mode
- polling-based file watching is enabled so changes from Windows/OneDrive reflect without restarting Docker

## Start once

```powershell
docker compose up --build
```

For detached mode:

```powershell
docker compose up --build -d
```

## Daily development flow

1. Start Docker once with `docker compose up -d`
2. Edit files in `backend` or `client`
3. Refresh `http://localhost:3000`

Code changes should reflect automatically. You should not need to restart Docker after each edit.

## Useful commands

```powershell
docker compose logs -f client
docker compose logs -f backend
docker compose down
```

## Notes

- Browser-facing frontend code should call `http://localhost:5000`, not `http://backend:5000`
- The backend talks to Mongo through the Docker network using `mongodb://mongo:27017/robobooks`
- Container `node_modules` are stored in named volumes so host files do not overwrite them
