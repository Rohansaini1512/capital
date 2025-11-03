# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

3. **Set Up Database**
   ```bash
   # Create PostgreSQL database
   createdb capital_amd

   # Run Prisma migrations
   npm run db:generate
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open `http://localhost:3000`
   - Create an account or login
   - Start making calls!

## Better-Auth Setup Notes

Better-Auth requires its own database tables for sessions and authentication. The current Prisma schema includes a `User` model that should work with Better-Auth, but you may need to:

1. Run Better-Auth migrations if available, or
2. Let Better-Auth create its own tables on first run

If Better-Auth creates its own `users` table, you may need to adjust the schema to either:
- Use Better-Auth's User table and extend it with your Call relationship
- Or create a separate `Profile` model that links to Better-Auth's User

Check the Better-Auth documentation for the exact table structure required.

## Troubleshooting

### "Table does not exist" errors
- Ensure Prisma migrations have run: `npm run db:push`
- Check that `DATABASE_URL` points to the correct database
- Verify database user has CREATE TABLE permissions

### Authentication not working
- Verify `BETTER_AUTH_SECRET` is set and matches in both server and client configs
- Check that `BETTER_AUTH_URL` matches your application URL
- Ensure cookies are enabled in your browser

### Build errors
- Delete `.next` folder and rebuild
- Run `npm run db:generate` to regenerate Prisma Client
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
