const express = require('express');
const axios = require('axios');
const Parser = require('rss-parser');

const app = express();
const port = 5500;

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (your HTML page)
app.use(express.static('public'));

// Handle form submission
app.post('/', async (req, res) => {
  const rssUrl = req.body.rss_url;

  try {
    // Fetch and parse the RSS feed
    const feedData = await parseRssFeed(rssUrl);

    // Log the parsed feed data to the console
    console.log('RSS Feed URL submitted:', rssUrl);
    console.log('Parsed RSS Feed Data:', feedData);

    // Convert the parsed feed data to an HTML representation
    const htmlFeed = generateHtmlFeed(feedData);

    // Send a response with the HTML representation of the parsed feed
    res.send(htmlFeed);
  } catch (error) {
    console.error('Error parsing RSS feed:', error.message);

    // Send an error response
    res.status(500).json({
      success: false,
      message: 'Error parsing RSS feed',
      error: error.message
    });
  }
});

// Function to fetch and parse the RSS feed
async function parseRssFeed(rssUrl) {
  const parser = new Parser();
  const feed = await parser.parseURL(rssUrl);

  // Extract relevant data from the feed
  const parsedData = feed.items.map(item => {
    return {
      title: item.title,
      summary: item.contentSnippet,
      link: item.link
    };
  });

  return parsedData;
}

// Function to generate HTML representation of the parsed feed
function generateHtmlFeed(feedData) {
  // Create an HTML string representing the RSS feed
  const htmlFeed = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Parsed RSS Feed</title>
      <style>
        body {
          background-color: black;
          color: white;
        }
      </style>
    </head>
    <body>
      <h1>Parsed RSS Feed</h1>
      <ul>
        ${feedData.map(item => `<li><a href="${item.link}">${item.title}</a>: ${item.summary}</li>`).join('')}
      </ul>
    </body>
    </html>
  `;

  return htmlFeed;
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
