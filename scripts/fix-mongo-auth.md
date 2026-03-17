# Fix MongoDB Authentication Error

If you see "Authentication failed" error, it means MongoDB was initialized with different credentials than what's in your `.env` file.

## Solution 1: Clear MongoDB Volume (Recommended for Development)

```bash
# Stop containers
npm run stop

# Remove MongoDB volume
docker volume rm mern-ts-tempalte-2_mongodb_data

# Or remove all volumes
docker-compose down -v

# Start again with correct credentials
npm run dev
```

## Solution 2: Update .env to Match Existing MongoDB

If you want to keep existing data, update your `.env` file to match the credentials MongoDB was initialized with.

## Solution 3: Check Your .env File

Make sure your `.env` has:
```
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_actual_password
MONGO_DATABASE=mern_db
```

And the MONGO_URI should match:
```
MONGO_URI=mongodb://admin:your_actual_password@mongodb:27017/mern_db?authSource=admin
```

