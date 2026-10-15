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

    try {
        const res = await fetch("http://127.0.0.1:5001/grade", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question, answer })
        });

        const data = await res.json();

        if (res.ok) {
            responseScore.textContent = "Grading Complete!";
            scoreText.textContent = `Score: ${data.score}`;
            reasoningText.textContent = `Reasoning: ${data.reasoning}`;
        } else {
            responseScore.textContent = "Error";
            reasoningText.textContent = `Error: ${data.error}`;
        }
    } catch (err) {
        responseScore.textContent = "Connection Error";
        reasoningText.textContent = "Could not connect to the Python backend server. Is backend.py running?";
    }
});