const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const  OpenAI  = require('openai');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// OpenAI configuration
const openai = new OpenAI({
    apiKey: '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',
});
// Mock database
const db = [];

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('Chatbot backend with OpenAI is running');
});


app.post('/chat', async (req, res) => {
    const { query } = req.body;
  
    try {
      // Call OpenAI API using the correct method
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Ensure you are using the correct model
        messages: [{ role: 'user', content: query }],
        max_tokens: 100,
      });
  
      const answer = completion.choices[0].message.content.trim();
      res.status(200).send({ answer });
    } catch (error) {
      console.error('Error getting response from OpenAI:', error.message);
      res.status(500).send({ message: 'Failed to process chat', error: error.message });
    }
  });
  
// POST endpoint to handle user questions and save chat history
// app.post('/chat', async (req, res) => {
//   const { query } = req.body;

//   try {
//     // OpenAI API call to get responses to user questions
//     const chatHistory = [];
//     // for (let question of questions) {
//       const completion = await openai.createCompletion({
//         model: 'text-davinci-003',
//         prompt: question,
//         max_tokens: 100,
//       })
//     //   });

//       const answer = completion.data.choices[0].text.trim();
//       chatHistory.push({ question, answer });
//     }

//     // Create a chat summary
//     const chatSummary = `User asked ${questions.length} questions. Here is a summary:\n` +
//       chatHistory.map((chat, index) => `${index + 1}. ${chat.question}: ${chat.answer}`).join('\n');

//     // Save to the mock database
//     const userData = { name, email, mobile, chatHistory, chatSummary };
//     db.push(userData);

//     // Send data to Salesforce (mock example)
//     await saveToSalesforce(userData);

//     res.status(200).send({ message: 'Chat processed and saved successfully', data: userData });
//   } catch (error) {
//     res.status(500).send({ message: 'Failed to process chat', error: error.message });
//   }
// });
// app.post('/chat', async (req, res) => {
//     const { query } = req.body;
  
//     if (!query) {
//       return res.status(400).json({ error: 'Query is required' });
//     }
  
//     try {
//       const response = await axios.post(
//         'https://api.openai.com/v1/engines/davinci-codex/completions', // Change to your engine
//         {
//           prompt: query,
//           max_tokens: 150
//         },
//         {
//           headers: {
//             'Authorization': `Bearer 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`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
  
//       const answer = response.data.choices[0].text.trim();
//       res.json({ answer });
//     } catch (error) {
//       console.error('Error getting response from OpenAI:', error.message);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });
// Function to simulate saving data to Salesforce
const saveToSalesforce = async (data) => {
  const salesforceEndpoint = 'https://your-salesforce-instance.com/api';
  const accessToken = 'your-salesforce-access-token';

  await axios.post(salesforceEndpoint, data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
