TaskForge Deployment (Render + Vercel)

Backend (Render)
1. Push repo to GitHub.
2. In Render: New → Web Service → Connect repo → Root directory: server/
3. Build: npm install && npm run build
4. Start: npm start
5. Environment:
   - NODE_VERSION=20
   - NODE_ENV=production
   - PORT=3001
   - JWT_SECRET=change-this-strong-secret
   - DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME
6. Deploy and test https://<your-service>.onrender.com/api/health

Frontend (Vercel)
1. New Project → import repo
2. Framework: Vite
3. Build: npm run build  |  Output: dist
4. Env: VITE_API_URL=https://<your-service>.onrender.com/api
5. Deploy → public link like https://<yourapp>.vercel.app

Notes
- Use server/ENV_EXAMPLE.txt and src/ENV_EXAMPLE.txt as references.
- Default admin: admin@taskforge.com / admin123.
- To restrict CORS later, configure allowed origins in server/src/server.ts.




