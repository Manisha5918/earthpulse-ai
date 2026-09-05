# EarthPulse AI — Frontend (Next.js 14) production image.
# Uses the existing Next.js project, npm + package-lock.json, no new dependencies.
# NEXT_PUBLIC_* values are inlined by Next.js at BUILD time, so the API base URL
# is accepted as a build ARG (wired from docker-compose build.args).
FROM node:18-alpine

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the existing application source and build it.
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
