# Use an official Node.js runtime as the base image
FROM node:16

# Install Python 3.9 and dependencies
RUN apt-get update && \
    apt-get install -y python3.9 python3.9-distutils python3-pip

# Set up Python 3.9 as the default version
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1

# Set the working directory for Node.js
WORKDIR /app/backend

# Copy the Node.js application
COPY ./backend/package.json ./backend/package-lock.json /app/backend/
COPY ./backend/server.js /app/backend/
COPY ./backend/controllers /app/backend/controllers
COPY ./backend/routes /app/backend/routes

# Install Node.js dependencies
RUN npm install

# Set the working directory for Python scripts and compiled files
WORKDIR /app/backend/python

# Copy Python scripts, models, and compiled code
COPY ./backend/python /app/backend/python
COPY ./backend/dist /app/backend/dist
COPY ./backend/build/phone_detector /app/backend/build/phone_detector

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Expose the port the app runs on
EXPOSE 3000

# Start the Node.js application
CMD ["node", "/app/backend/server.js"]
