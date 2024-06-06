const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FILES_DIR = path.join(__dirname, 'files');

// Ensure the directory exists
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

// Function to format date to be filename friendly
const formatDate = (date) => {
  return date.toISOString().replace(/:/g, '-').replace(/\..+/, '');
};

// Function to create a file with current timestamp
const createFileWithTimestamp = () => {
  const now = new Date();
  const timestamp = now.toISOString();
  const filename = `${formatDate(now)}.txt`;
  const filepath = path.join(FILES_DIR, filename);

  fs.writeFile(filepath, timestamp, (err) => {
    if (err) {
      console.error("Error creating file:", err);
    } else {
      console.log(`File created: ${filename}`);
    }
  });
};

// Store the interval ID
let intervalId = setInterval(createFileWithTimestamp, 60000); // 60000 milliseconds = 1 minute

// Endpoint to retrieve all text files in the directory
//http://localhost:3000/files
app.get('/files', (req, res) => {
  fs.readdir(FILES_DIR, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).send('Error reading directory');
    }
    const textFiles = files.filter(file => file.endsWith('.txt'));
    res.json(textFiles);
  });
});

// Endpoint to manually create a timestamp file
//http://localhost:3000/create-file
app.post('/create-file', (req, res) => {
  createFileWithTimestamp();
  res.send('Timestamp file created');
});

// Endpoint to stop creating timestamp files
//http://localhost:3000/stop-creating-files
app.post('/stop-creating-files', (req, res) => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    res.send('Stopped creating timestamp files');
  } else {
    res.send('Timestamp file creation is already stopped');
  }
});

// Endpoint to serve the content of the latest timestamp file
//http://localhost:3000/latest-file-content
app.get('/latest-file-content', (req, res) => {
  fs.readdir(FILES_DIR, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).send('Error reading directory');
    }
    const textFiles = files.filter(file => file.endsWith('.txt'));
    if (textFiles.length === 0) {
      return res.status(404).send('No files found');
    }
    const latestFile = textFiles.sort().reverse()[0]; // Get the latest file
    const filepath = path.join(FILES_DIR, latestFile);
    fs.readFile(filepath, 'utf-8', (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).send('Error reading file');
      }
      res.send(data);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
