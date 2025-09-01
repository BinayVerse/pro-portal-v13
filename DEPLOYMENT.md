# Deployment Guide

This guide covers how to deploy the Provento.ai application using Docker and Docker Compose.

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)
- At least 2GB of RAM available
- Port 80 and 443 available (for production)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd provento-ai

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 2. Development Deployment

```bash
# Build and start services
docker-compose up --build

# Or run in background
docker-compose up -d --build

# View logs
docker-compose logs -f web
```

The application will be available at:

- **Application**: http://localhost:3000
- **With Nginx**: http://localhost

### 3. Production Deployment

```bash
# Set environment to production
export NODE_ENV=production

# Build and deploy
docker-compose -f docker-compose.yml up -d --build

# Check status
docker-compose ps
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
NODE_ENV=production
NUXT_HOST=0.0.0.0
NUXT_PORT=3000

# Optional (database)
DATABASE_URL=postgresql://user:pass@postgres:5432/provento
JWT_SECRET=your_secure_jwt_secret

# Optional (external services)
OPENAI_API_KEY=your_openai_key
```

### Database Setup (Optional)

If you need a database, uncomment the postgres service in `docker-compose.yml`:

```yaml
postgres:
  image: postgres:15-alpine
  environment:
    - POSTGRES_DB=provento
    - POSTGRES_USER=postgres
    - POSTGRES_PASSWORD=your_password
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

### SSL/HTTPS Setup

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Place certificates in `./ssl/` directory
3. Uncomment HTTPS server block in `nginx.conf`
4. Update your domain name in the configuration

## Docker Commands

### Building

```bash
# Build the application image
docker build -t provento-ai .

# Build with Docker Compose
docker-compose build
```

### Running

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up web

# Scale the web service
docker-compose up --scale web=3
```

### Monitoring

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f web

# Check container status
docker-compose ps

# Monitor resource usage
docker stats
```

### Maintenance

```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Update and restart
docker-compose pull
docker-compose up -d

# Clean up unused images
docker image prune -a
```

## Production Considerations

### 1. Security

- Use environment variables for secrets
- Enable HTTPS with valid SSL certificates
- Configure proper firewall rules
- Regularly update base images

### 2. Performance

- Use a CDN for static assets
- Configure proper caching headers
- Monitor resource usage
- Consider horizontal scaling

### 3. Monitoring

```bash
# Health check endpoint
curl http://localhost/health

# Application logs
docker-compose logs -f web

# System monitoring
docker stats
```

### 4. Backup

```bash
# Backup database (if using)
docker-compose exec postgres pg_dump -U postgres provento > backup.sql

# Backup volumes
docker run --rm -v provento_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .
```

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Check what's using the port
   sudo lsof -i :3000

   # Kill the process or change ports in docker-compose.yml
   ```

2. **Permission denied**

   ```bash
   # Fix Docker permissions
   sudo usermod -aG docker $USER

   # Re-login or run
   newgrp docker
   ```

3. **Build failures**

   ```bash
   # Clear Docker cache
   docker builder prune -a

   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Memory issues**
   ```bash
   # Increase Docker memory limit
   # Check Docker Desktop settings or system resources
   ```

### Logs and Debugging

```bash
# Application logs
docker-compose logs web

# Nginx logs
docker-compose logs nginx

# Database logs (if using)
docker-compose logs postgres

# Enter container for debugging
docker-compose exec web sh
```

## Scaling

### Horizontal Scaling

```bash
# Scale web service
docker-compose up --scale web=3 -d

# Use load balancer (update nginx.conf)
upstream app {
    server web_1:3000;
    server web_2:3000;
    server web_3:3000;
}
```

### Resource Limits

Add to `docker-compose.yml`:

```yaml
web:
  deploy:
    resources:
      limits:
        cpus: '0.50'
        memory: 512M
      reservations:
        cpus: '0.25'
        memory: 256M
```

## Support

For deployment issues:

- Check logs: `docker-compose logs -f`
- Verify configuration: `docker-compose config`
- Contact: support@provento.ai
