var express = require('express');
require('dotenv').config();
const { body, validationResult } = require("express-validator");
let encoded = require('./encodedData');
const helpers = require('./helpers');

const { GoogleGenerativeAI } = require("@google/generative-ai");

const generationConfig = {
  temperature: 1,
  top_p: 0.95,
  top_k: 40,
  response_mime_type: "application/json",
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, generationConfig);

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
  console.log(response.response.text());
  return response.response.text();
}

// console.log(generateContent("Promote your own YouTube channel on embedded microcontroller development"));



var router = express.Router();

const refactoringJSON = (data) => {
  let json_data = JSON.parse(data);
  for (const task of json_data.subtasks) {
    task.start_date = new Date(task.start_date).getUTCDate();
    task.due_date = new Date(task.due_date).getUTCDate();
  }
  return json_data;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', data: refactoringJSON(encoded), getColorByComplexity: helpers.getColorByComplexity });
});

router.get('/prompt', async function (req, res) {
  const userPrompt = req.query.prompt;

  try {
    const generatedContent = await generateContent(userPrompt);
    encoded = JSON.parse(generatedContent); 

  
    res.send(`
      <script>
        alert('The generation is complete! The data has been updated.');
        window.location.href = '/'; 
      </script>
    `);
  } catch (error) {
    console.error('Error when generating content:', error);
    res.send(`
      <script>
        alert('An error occurred when generating the plan.');
        window.location.href = '/'; 
      </script>
    `);
  }
});

module.exports = router;



