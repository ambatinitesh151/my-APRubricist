import { GoogleGenAI } from "https://esm.run/@google/genai";

// ⚠️ REPLACE THIS with your actual Gemini API Key from Google AI Studio
const API_KEY = "YOUR_GEMINI_API_KEY_HERE";

// Initialize the Gemini client directly in the browser
const ai = new GoogleGenAI({ apiKey: API_KEY });

const questionInput = document.getElementById("QuestionInput");
const answerInput = document.getElementById("AnswerInput");
const submitButton = document.getElementById("SubmitButton");

const responseScore = document.getElementById("ResponseScoreSection");
const questionText = document.getElementById("QuestionText");
const responseText = document.getElementById("AnswerText");
const scoreText = document.getElementById("ScoreText");
const reasoningText = document.getElementById("ReasoningText");

submitButton.addEventListener("click", async function () {
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (question === "" || answer === "") {
        responseScore.textContent = "Missing Input";
        responseText.textContent = "Please enter both a question and an answer.";
        return;
    }

    // Show loading state while waiting for Gemini
    responseScore.textContent = "Grading in progress...";
    questionText.textContent = `Question: ${question}`;
    responseText.textContent = `Response: ${answer}`;
    scoreText.textContent = "";
    reasoningText.textContent = "";

    const prompt = `
    You are an expert AP grader. Grade the following Short Answer Question (SAQ) response based on historical accuracy and standard AP grading criteria (evaluating specific tasks if applicable).
    
    Question:
    ${question}
    
    Student Answer:
    ${answer}
    
    Provide your output in this exact format:
    SCORE: [e.g., 0/3] (maybe 1/3, 2/3, or 3/3 depending on the number of tasks and details that are needed)

    REASONING: [Detailed explanation of why it earned or missed the point based on AP standards]
    `;

    try {
        // Call Gemini directly using the browser SDK
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt
        });

        const rawText = response.text.strip ? response.text.strip() : response.text.trim();

        let score = "N/A";
        let reasoning = rawText;

        if (rawText.includes("SCORE:") && rawText.includes("REASONING:")) {
            const parts = rawText.split("REASONING:");
            score = parts[0].replace("SCORE:", "").trim();
            reasoning = parts[1].trim();
        }

        responseScore.textContent = "Grading Complete!";
        scoreText.textContent = `Score: ${score}`;
        reasoningText.textContent = `Reasoning: ${reasoning}`;

    } catch (err) {
        console.error(err);
        responseScore.textContent = "Error";
        reasoningText.textContent = `Failed to grade response: ${err.message}`;
    }
});