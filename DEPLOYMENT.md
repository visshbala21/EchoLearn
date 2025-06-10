# 🚀 EchoLearn Deployment Guide

This guide covers deploying EchoLearn to production for the hackathon.

## Quick Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED
**Time to deploy: ~15 minutes**

#### Backend on Railway
1. Create account at [Railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Set environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SIGNALL_API_KEY=your_signall_api_key (optional)
   DATABASE_URL=sqlite:///./echolearn.db
   SECRET_KEY=your_secret_key
   ENVIRONMENT=production
   ```
4. Railway will auto-deploy from `backend/` directory

#### Frontend on Vercel
1. Create account at [Vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
4. Set environment variables:
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   ```

### Option 2: Heroku (Full Stack)
**Time to deploy: ~20 minutes**

1. Create `Procfile` in root:
   ```
   web: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. Create `runtime.txt`:
   ```
   python-3.9.12
   ```

3. Deploy to Heroku with environment variables

### Option 3: DigitalOcean App Platform
**Time to deploy: ~25 minutes**

1. Create App Spec:
   ```yaml
   name: echolearn
   services:
   - name: backend
     source_dir: /backend
     github:
       repo: your-username/echolearn
       branch: main
     run_command: uvicorn main:app --host 0.0.0.0 --port $PORT
     environment_slug: python
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: OPENAI_API_KEY
       value: your_api_key
   - name: frontend
     source_dir: /frontend
     github:
       repo: your-username/echolearn
       branch: main
     build_command: npm run build
     run_command: npx serve -s dist -p $PORT
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
   ```

## Environment Variables

### Backend Required:
- `OPENAI_API_KEY`: Your OpenAI API key
- `SECRET_KEY`: Random secret key for sessions
- `DATABASE_URL`: Database connection string
- `ENVIRONMENT`: Set to "production"

### Backend Optional:
- `SIGNALL_API_KEY`: For enhanced ASL translation

### Frontend Required:
- `VITE_API_URL`: Backend API URL

## Database Setup

### SQLite (Development/Small Scale)
- Default configuration works out of the box
- File-based database created automatically

### PostgreSQL (Production Recommended)
1. Create PostgreSQL database (Railway/Heroku provide free tiers)
2. Update `DATABASE_URL` in backend environment
3. Update `database.py` if needed for PostgreSQL connection

### Example PostgreSQL setup:
```python
# In database.py, replace sqlite URL with:
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/echolearn")
```

## API Key Setup

### OpenAI API Key (Required)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Add to environment variables
4. **Important**: Set usage limits to avoid unexpected charges

### SignAll API Key (Optional)
1. Register at [SignAll.us](https://www.signall.us/)
2. Get API credentials
3. Add to environment variables
4. If not provided, app will use fallback ASL translation

## Performance Optimization

### Backend
- Enable gzip compression
- Add caching for transcriptions
- Implement rate limiting
- Use async/await for all API calls

### Frontend
- Build optimization already configured
- Lazy load components
- Image compression for assets
- CDN for static assets

## Security Checklist

- [ ] Environment variables set securely
- [ ] API keys not exposed in frontend
- [ ] CORS configured for production domains
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] HTTPS enabled (handled by platforms)

## Monitoring & Debugging

### Logs
- Check platform logs for errors
- Monitor API usage in OpenAI dashboard
- Set up error tracking (Sentry recommended)

### Health Checks
- Backend: `GET /health`
- Frontend: Basic connectivity test

## Scaling Considerations

### For High Usage:
1. **Database**: Migrate to PostgreSQL with connection pooling
2. **File Storage**: Use cloud storage (AWS S3) for audio files
3. **Caching**: Implement Redis for session data
4. **CDN**: Use Cloudflare for global distribution
5. **Load Balancing**: Multiple backend instances

### Cost Optimization:
- Monitor OpenAI API usage
- Implement audio compression
- Cache transcriptions
- Set usage limits

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check API URL in frontend .env
   - Verify CORS origins in backend

2. **OpenAI API Errors**
   - Check API key validity
   - Monitor usage limits
   - Handle rate limiting gracefully

3. **Audio Upload Issues**
   - Check file size limits
   - Verify audio format support
   - Test microphone permissions

4. **ASL Translation Not Working**
   - Check if SignAll API key is set
   - Fallback translation should still work

## Quick Deploy Commands

```bash
# Build for production
cd frontend && npm run build

# Test production build locally
cd frontend && npm run preview

# Backend production mode
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## Demo/Hackathon Tips

1. **Prepare Demo Data**: Have sample audio files ready
2. **Test All Features**: Transcription, ASL, Quiz, Summary
3. **Mobile Testing**: Ensure responsive design works
4. **Backup Plan**: Local deployment if cloud fails
5. **API Limits**: Monitor OpenAI usage during demo

## Support

For deployment issues:
- Check platform documentation
- Review application logs
- Test API endpoints individually
- Verify environment variables

Good luck with your hackathon! 🎉 