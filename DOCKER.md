# Docker Build Instructions

This project has been dockerized and can be built and run using Docker or Docker Compose.

## Quick Start with Docker Compose

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f landing-page

# Stop the container
docker-compose down
```

## Building with Docker

```bash
# Build the image
docker build -t landing-page:latest .

# Run the container
docker run -p 3000:3000 landing-page:latest

# Run in detached mode
docker run -d -p 3000:3000 --name landing-page landing-page:latest

# View logs
docker logs -f landing-page

# Stop the container
docker stop landing-page
docker rm landing-page
```

## Environment Variables

The application uses environment variables that can be configured:

- `NODE_ENV`: Set to `production` by default
- Add any additional environment variables needed by your application in `docker-compose.yml` or via the `docker run -e` flag

## Development Mode

For development with live reloading:

```bash
docker-compose up
```

And uncomment the volumes and stdin/tty settings in `docker-compose.yml` to enable interactive mode.

## Troubleshooting

- **Port already in use**: Change the port mapping in `docker-compose.yml` (e.g., `3001:3000`)
- **Out of memory**: Increase Docker's memory allocation in Docker Desktop settings
- **Build fails**: Ensure all dependencies are correctly specified in workspace packages

## Notes

- The Dockerfile uses a multi-stage build to minimize the final image size
- The image includes only production dependencies
- Health checks are configured to monitor container health
