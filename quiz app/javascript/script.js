const categoryButtons = document.querySelectorAll(".category-option");
const questionButtons = document.querySelectorAll(".questions-option");
const startButton = document.querySelector(".start-quiz");
const quizContainer = document.querySelector(".quiz-container");
const configContainer = document.querySelector(".config-container");
const resultContainer = document.querySelector(".result-container");
const nextButton = document.querySelector(".next-question");
const retryButton = document.querySelector(".retry");

let selectedCategory = "Programming";
let numberOfQuestions = 10;
let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let timer;
const timePerQuestion = 15;

// Define category mapping
const categories = {
    "Programming": 18,
    "English": 10,
    "History": 23,
    "Entertainment": 11
};

// Default view
window.onload = () => {
    configContainer.style.display = "block";
    quizContainer.style.display = "none";
    resultContainer.style.display = "none";
};

// Select category
categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        categoryButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedCategory = btn.innerText.trim();
    });
});

// Select number of questions
questionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        questionButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        numberOfQuestions = parseInt(btn.innerText.trim());
    });
});
//customised alert
function showToast(message = "Quiz App says... Please wait or Try again later.") {
    let toast = document.createElement('div');
    toast.className = 'toast-popup';
    toast.textContent = message;
    document.body.appendChild(toast);
    toast.style.display = 'block';

    setTimeout(() => {
        toast.remove();
    }, 2000);
}


// Start quiz
startButton.addEventListener("click", async () => {
    const categoryId = categories[selectedCategory];
    const url = `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=${categoryId}&difficulty=easy&type=multiple`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        questions = data.results;
        if (!questions || questions.length === 0) throw new Error("No questions fetched!");

        configContainer.style.display = "none";
        quizContainer.style.display = "block";
        currentQuestionIndex = 0;
        score = 0;
        showQuestion();
    } catch (error) {
        console.error("API fetch error:", error);
        // alert("Failed to load quiz. Please try again.");
        showToast();
    }
});

// Show question
function showQuestion() {
    const q = questions[currentQuestionIndex];
    const questionElem = document.querySelector(".question");
    const optionsContainer = document.querySelector(".quiz-content");
    const questionStatus = document.querySelector(".ques-status");

    // Clear old options
    optionsContainer.querySelectorAll(".answer-option").forEach(e => e.remove());

    // Set question text
    questionElem.innerHTML = decodeHTML(q.question);

    // Prepare and shuffle options
    const answers = [
        ...q.incorrect_answers.map(a => ({ text: decodeHTML(a), correct: false })),
        { text: decodeHTML(q.correct_answer), correct: true }
    ];
    shuffle(answers);

    // Add answers to DOM
    answers.forEach(ans => {
        const ul = document.createElement("ul");
        ul.className = "answer-option";
        ul.innerHTML = `
            <li class="answer" data-correct="${ans.correct}">
                <p>${ans.text}</p>
            </li>`;
        optionsContainer.appendChild(ul);
    });

    questionStatus.innerHTML = `<b>${currentQuestionIndex + 1}</b> of <b>${questions.length}</b> Questions`;

    document.querySelectorAll(".answer").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".answer").forEach(opt => opt.classList.remove("correct", "incorrect"));
            if (btn.dataset.correct === "true") {
                btn.classList.add("correct");
                score++;
            } else {
                btn.classList.add("incorrect");
                document.querySelectorAll(".answer").forEach(opt => {
                    if (opt.dataset.correct === "true") opt.classList.add("correct");
                });
                //disabling pointer after answering
                document.querySelectorAll(".answer").forEach(opt =>{
                    opt.style.pointerEvents='none';
                })
                
            }
            clearInterval(timer);
        });
    });

    startTimer(timePerQuestion);
}

// Timer function
function startTimer(seconds) {
    const timerElem = document.querySelector(".duration");
    let timeLeft = seconds;
    timerElem.textContent = `${timeLeft}s`;

    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerElem.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextButton.click();
        }
    }, 1000);
}

// Next question
nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        clearInterval(timer);
        showResult();
    }
});

// Show result
function showResult() {
    quizContainer.style.display = "none";
    resultContainer.style.display = "block";

     // Calculate percentage
     const badge = document.createElement("span");
    badge.classList.add("score-badge");

    const percentage = (score / questions.length) * 100;


    document.querySelector(".result-msg").innerHTML = 
        `You answered <b>${score}</b> out of <b>${questions.length}</b> questions correctly.`;
    document.querySelector(".score-badge").innerHTML = 
        ` ${score} / ${questions.length}`;
}

// Retry quiz
retryButton.addEventListener("click", () => {
    configContainer.style.display = "block";
    quizContainer.style.display = "none";
    resultContainer.style.display = "none";
});

// Utility: decode HTML entities
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// Utility: shuffle array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
