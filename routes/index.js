var express = require('express');
require('dotenv').config();
const { body, validationResult } = require("express-validator");
const fs = require('fs');
const helpers = require('./helpers');


// Read JSON data from file
const newdata =JSON.parse(fs.readFileSync('./routes/data.json', 'utf8'));
// console.log(data);
const { GoogleGenerativeAI } = require("@google/generative-ai");


const generationConfig = {
  temperature: 1,
  top_p: 0.95,
  top_k: 40,
  response_mime_type: "application/json",
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, generationConfig);

const sanitizeJSON = (data) => {
  return data.replace(/```json|```/g, '').trim();
};

async function generateContent( taskDescription) {
  const prompt = `
       Decompose the following task into smaller, manageable subtasks.  
        For each subtask, decompose it further into microtasks where possible.  
        Ensure each subtask and microtask has:
        - A title
        - A brief description
        - An estimated time to complete (in hours)
        - A complexity level (Easy, Medium, or Hard)
        - A start date in YYYY-MM-DD format
        - A due date in YYYY-MM-DD format  

        Format the output as a JSON object with:
        - A "task" key (original task description)
        - A "subtasks" key containing a list of subtask objects
        - Each subtask can contain a "microtasks" key (list of microtask objects)  

        Example JSON output: 
        {
            "task": "Your task description goes here",
            "subtasks": [
                {
                    "title": "Subtask title",
                    "description": "Subtask description",
                    "estimated_time": 10,
                    "complexity": "Medium",
                    "start_date": "2024-10-30",
                    "due_date": "2024-11-01",
                    "microtasks": [
                        {
                            "title": "Microtask title",
                            "description": "Microtask description",
                            "estimated_time": 2,
                            "complexity": "Easy",
                            "start_date": "2024-10-30",
                            "due_date": "2024-10-31"
                        }
                    ]
                }
            ]
        }
        Task: ${taskDescription}
    `;
  const response = await model.generateContent(prompt);
  console.log('Raw response:', response.response.text());
  return response.response.text();
}


const refactoringJSON = (data) => {
  try {
      const jsonData = JSON.parse(data);
      for (const task of jsonData.subtasks) {
          task.start_date = new Date(task.start_date).toISOString();
          task.due_date = new Date(task.due_date).toISOString();
      }
      return jsonData;
  } catch (error) {
      console.error("Error while parsing or processing JSON:", error);
      throw new Error("Invalid JSON structure");
  }
};

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { data: newdata, getColorByComplexity: helpers.getColorByComplexity}); 
});


router.get('/prompt', async function (req, res) {
  const userPrompt = req.query.prompt; 

  if (!userPrompt) {
      return res.status(400).json({ error: "Missing 'prompt' in query parameters" });
  }

  try {
      // const newdata = JSON.parse(fs.readFileSync('./routes/data.json', 'utf8'));

      const generatedContent = await generateContent(userPrompt);
      const sanitizedContent = sanitizeJSON(generatedContent);
      const refact = refactoringJSON(sanitizedContent);
      res.status(200).json({ data: refact });
  } catch (error) {
      console.error('Error when generating content:', error);
      res.status(500).json({ error: 'An error occurred when generating the plan.' });
  }
});

module.exports = router;