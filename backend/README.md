# Backend Setup and Production Notes

This Node/Express service provides the API for the BPSC clone application.

## Environment Variables

Copy `.env.example` to `.env` and fill out real values. Typical variables:

```
MONGODB_URI=mongodb://user:pass@host:port/dbname
PORT=5000
NODE_ENV=production
ADMIN_EMAIL=admin@example.com    # used by seed.js
ADMIN_PASS=veryStrongPassword
```

- Never commit `.env` or any file with secrets. They've already been added to `.gitignore`.
- For containerized or hosted deployments, set the same variables via your platform's configuration mechanism.

## Scripts

```bash
npm install           # install dependencies (after editing package.json)
npm run seed          # create initial admin user (reads from ENV)
npm start             # start server in normal mode
npm run dev           # start with nodemon for local development
```

`seed.js` will exit immediately if an admin user already exists. Use it only once when initializing a fresh database.

## Production Hardening

- Security middleware (`helmet`, `compression`) are enabled when `NODE_ENV=production`.
- Request logging uses `morgan` (combined format in prod).
- If a built frontend lives in `../frontend/dist` we serve it as static files when in production mode.

## Database

The connection string is read from `MONGODB_URI`. Local development defaults to
`mongodb://127.0.0.1:27017/bpsc_clone`.


## Git

A `.gitignore` file exists to ignore `node_modules`, `.env`, logs and other local artifacts.

## Deployment Checklist

1. **MongoDB Atlas** – create a free cluster at https://www.mongodb.com/cloud/atlas, whitelist your server IP (or 0.0.0.0/0 for simplicity during development), and obtain the connection URI.  
   - Replace the placeholder in your `.env` with the URI.  
   - You can also generate a database user with a strong password and use that in the URI.
2. Build the frontend (`cd ../frontend && npm run build`).
3. Ensure environment variables are set on the target server (see `.env.example` for required keys).  
   - `CORS_ORIGIN` should be set to the URL where the frontend will be served (e.g. `https://example.com`).
4. Run the seed script once, if needed.
5. Start the service using `npm start` or a process manager (pm2, systemd, Docker, etc.).

### Hostinger-specific notes

If you plan to host both frontend and backend on Hostinger:

- **Frontend**: upload the contents of `frontend/dist` to the `public_html` folder of your Hostinger account (you can use the File Manager or FTP).  
  Ensure `VITE_API_URL` is set to your backend application's URL before building.

- **Backend**: Hostinger supports Node.js apps via the hPanel "Node.js" section.  
  1. Create a new Node.js application and select the root directory (e.g. `/home/username/bpsctech_offical/backend`).  
  2. Set environment variables (`MONGODB_URI`, `ADMIN_EMAIL`, etc.) in the application settings.  
  3. Use the built‑in terminal or SSH to run `npm install` and `npm run seed`.  
  4. Start the app with `npm start`, and it will listen on the port Hostinger assigns (it will be available through `http://yourdomain.com:PORT`).  
  5. You can configure a reverse proxy or use a subdomain to point to the Node.js port if needed.

- Remember to whitelist Hostinger’s outgoing IPs in Atlas (they may change).  
- After deployment verify the frontend can reach the backend, and your CORS_ORIGIN matches.
