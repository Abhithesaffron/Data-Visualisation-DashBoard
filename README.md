Visualization Dashboard App
This is a full-stack web application for visualizing data through various types of charts and graphs. The backend is powered by MongoDB for storing and fetching the data, while the frontend uses modern web technologies for dynamic data visualization.

# The dashborad image is also atached in the file "Dashboard-Image" , after execting , the app will be rendered similar as shown in images 

Features
Upload data to MongoDB via an API.
Real-time data visualization using various charts and graphs (bar chart, heatmap, line chart, etc.).
Filters for country selection and date range customization.
Responsive design and interactive charts for an enhanced user experience.
Project Structure
The project is divided into two main parts:

1. Backend (Server)
index.js: Script to upload the data into the MongoDB database.
server.js: Express API server for fetching the data from MongoDB and serving it to the frontend.
2. Frontend (visualisation-Dashboard)
React + D3.js: The frontend uses React for managing the UI and D3.js for data visualizations.
Prerequisites
Node.js: Ensure that Node.js is installed on your system.
MongoDB: You will need a MongoDB instance (local or cloud) for storing and retrieving data.
Backend Setup (Server)
1. Install Backend Dependencies
To set up the backend server, navigate to the server directory and install the necessary dependencies:

bash
Copy code
# Navigate to the server directory
cd server

# Install dependencies
npm install cors mongoose express
2. Upload Data to MongoDB
You can upload data to the MongoDB database using the provided script:

Open index.js and ensure that the MongoDB URI is correctly set.
Run the following command to upload the data:
bash
Copy code
# Run the data upload script
node index.js
This will upload your data to MongoDB.

3. Running the API Server
After uploading the data, you can start the Express server to serve the data to the frontend:

bash
Copy code
# Run the Express server
node server.js
The server will run on http://localhost:3001 by default, providing an API for the frontend to fetch data from MongoDB.

Frontend Setup (visualisation-Dashboard)
1. Install Frontend Dependencies
Navigate to the visualisation-Dashboard directory and install the necessary dependencies:

bash
Copy code
# Navigate to the frontend directory
cd visualisation-Dashboard

# Install dependencies
npm install
2. Run the Frontend Application
After the dependencies are installed, run the development server to start the frontend:

bash
Copy code
# Run the frontend application
npm run dev
This will start the frontend server on http://localhost:5173 (or another port if configured differently). You can now access the dashboard and interact with the visualizations.

Environment Variables
Make sure you set up the following environment variables in a .env file in the root of your server directory:

makefile
Copy code
# MongoDB Configuration
MONGODB_URI=<your-mongodb-connection-string>

# Server
PORT=3001
The MONGODB_URI should contain the connection string for your MongoDB instance, which could be hosted locally or on a cloud service like MongoDB Atlas.

Available Visualizations
The frontend dashboard provides a variety of visualizations based on the data, including:

Bar Chart: Displays the intensity of various sectors.
Heatmap: Visualizes topics across different countries.
Box Plot: Shows relevance distribution across topics.
Scatter Plot: Displays the relationship between intensity and relevance.
Line Chart: Tracks intensity trends across different pestle categories.
Pie Chart: Represents yearly trends.
Bubble Chart: Shows insights count by topic.
Stacked Bar Chart: Visualizes country-specific intensity.
Lollipop Chart: Displays trends based on the publication date.
Each graph has its own filter options, such as selecting countries or specifying a date range, enabling you to customize the data display.

How to Use
Upload Data: Use the index.js script in the backend to upload your dataset to MongoDB.
Start the Servers:
Start the backend server with node server.js to provide API endpoints.
Start the frontend with npm run dev in the visualisation-Dashboard directory.
Visualize Data: Access http://localhost:5173 in your browser to interact with the dashboard and visualizations.