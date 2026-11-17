# WelfareNet Backend - Docker Guide

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Your `.env` file configured with database credentials

### Start the Application

**Windows:**
```powershell
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend
```

**Access the application:**
- Application: http://localhost:8080
- Health Check: http://localhost:8080/actuator/health

### Stop the Application
```powershell
docker-compose down
```

---

## 📋 What's Been Dockerized

### Files Created:
1. **Dockerfile** - Production build (multi-stage, optimized)
2. **Dockerfile.dev** - Development build (with hot reload)
3. **docker-compose.yml** - Production configuration
4. **docker-compose.dev.yml** - Development configuration
5. **.dockerignore** - Files excluded from Docker build
6. **.env.example** - Example environment variables

### Configuration Files Updated:
- **application.properties** - Added actuator health endpoint
- **pom.xml** - Added Spring Boot Actuator dependency
- **.env** - Your existing environment variables (already configured)

---

## 🐳 Docker Commands

### Production Mode

```powershell
# Build the image
docker-compose build

# Start in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Check container status
docker-compose ps

# Stop containers
docker-compose down

# Rebuild from scratch (no cache)
docker-compose build --no-cache
docker-compose up -d
```

### Development Mode (Hot Reload + Debugging)

```powershell
# Start development mode
docker-compose -f docker-compose.dev.yml up

# With rebuild
docker-compose -f docker-compose.dev.yml up --build

# Stop
docker-compose -f docker-compose.dev.yml down
```

**Development features:**
- Hot reload when you save Java files
- Remote debugging on port 5005
- Source code mounted as volume

---

## 🔧 Troubleshooting

### Error: "Driver com.mysql.cj.jdbc.Driver claims to not accept jdbcUrl"

**Cause:** Environment variables not being loaded properly.

**Solution:**
1. Ensure `.env` file exists in the Backend folder
2. Check that variable names match exactly:
   - `DB_DATASOURCE` (not DB_URL)
   - `MAIL_USER` (not MAIL_USERNAME)
   - `AWS_BUCKET_NAME` (not AWS_S3_BUCKET)
   - `AWS_SECRETACCESSKEY` (not AWS_SECRET_ACCESS_KEY)

### Container won't start

```powershell
# Check logs
docker-compose logs backend

# Check if port 8080 is already in use
netstat -ano | findstr :8080

# Inspect container
docker inspect welfarenet-backend
```

### Database connection issues

1. Verify `.env` has correct `DB_DATASOURCE`, `DB_USERNAME`, `DB_PASSWORD`
2. Ensure your cloud database allows connections from Docker host IP
3. Check if the SSL mode is correct in your connection string

### Out of memory

Edit `docker-compose.yml`:
```yaml
environment:
  - JAVA_OPTS=-Xmx1024m -Xms512m  # Increase from 512m to 1024m
```

---

## 📦 Image Details

### Production Image (`Dockerfile`)
- **Base:** Eclipse Temurin 17 JRE Alpine
- **Size:** ~200MB (minimal)
- **Security:** Runs as non-root user
- **Build:** Multi-stage (Maven build → JRE runtime)
- **Health Check:** Enabled via actuator

### Development Image (`Dockerfile.dev`)
- **Base:** Maven 3.9.6 with JDK 17
- **Size:** ~500MB (includes build tools)
- **Features:** Hot reload, remote debugging
- **Debug Port:** 5005

---

## 🔒 Security Best Practices

✅ **Already Implemented:**
- Non-root user in production image
- Multi-stage build (no build tools in production)
- Environment variables for sensitive data
- `.env` excluded from Git (via `.gitignore`)

⚠️ **Recommended for Production:**
1. Use Docker secrets instead of `.env` file
2. Enable HTTPS/TLS
3. Implement rate limiting
4. Regular security scans: `docker scan welfarenet-backend`

---

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```
GET http://localhost:8080/actuator/health
```

Response when healthy:
```json
{
  "status": "UP"
}
```

### Docker Health Status
```powershell
docker inspect --format='{{.State.Health.Status}}' welfarenet-backend
```

### View Application Logs
```powershell
# All logs
docker-compose logs backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Follow logs in real-time
docker-compose logs -f backend
```

---

## 🚢 Deployment to Production

### Option 1: Docker Hub

```powershell
# Tag the image
docker tag welfarenet-backend:latest yourusername/welfarenet-backend:1.0.0

# Push to Docker Hub
docker push yourusername/welfarenet-backend:1.0.0

# On production server
docker pull yourusername/welfarenet-backend:1.0.0
docker run -d -p 8080:8080 --env-file .env yourusername/welfarenet-backend:1.0.0
```

### Option 2: Docker Compose on Server

```bash
# On your server
git clone <your-repo>
cd Backend
cp .env.example .env
# Edit .env with production values
docker-compose up -d
```

---

## 🎯 Architecture

**Type:** Monolithic Architecture

**Components in Single Container:**
- Spring Boot Application
- REST API Controllers
- Security & Authentication
- Database Access (JPA/Hibernate)
- Email Service
- S3 Integration
- WebSocket Support

**External Dependencies:**
- MySQL Database (Cloud - Aiven)
- AWS S3 (File Storage)
- Gmail SMTP (Email Service)

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_DATASOURCE` | JDBC connection URL | `jdbc:mysql://host:port/db` |
| `DB_USERNAME` | Database username | `admin` |
| `DB_PASSWORD` | Database password | `secret123` |
| `MAIL_USER` | Email username | `user@gmail.com` |
| `MAIL_PASSWORD` | Email app password | `xxxx xxxx xxxx xxxx` |
| `AWS_REGION` | AWS region | `ap-southeast-1` |
| `AWS_BUCKET_NAME` | S3 bucket name | `welfarenet` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` |
| `AWS_SECRETACCESSKEY` | AWS secret key | `...` |

---

## ✅ Verification Checklist

After starting the container:

- [ ] Container is running: `docker-compose ps`
- [ ] Health check passes: `curl http://localhost:8080/actuator/health`
- [ ] Application logs show no errors: `docker-compose logs backend`
- [ ] Can access API endpoints
- [ ] Database connection successful
- [ ] S3 file upload works
- [ ] Email sending works

---

## 🆘 Need Help?

1. Check container logs: `docker-compose logs backend`
2. Verify environment variables: `docker-compose exec backend env`
3. Access container shell: `docker-compose exec backend sh`
4. Check health status: `docker inspect welfarenet-backend`

---

## 📚 Next Steps

1. ✅ Docker setup complete
2. Test all API endpoints
3. Set up CI/CD pipeline
4. Configure production environment
5. Set up monitoring (Prometheus/Grafana)
6. Implement backup strategy

**Your backend is now fully Dockerized! 🎉**

