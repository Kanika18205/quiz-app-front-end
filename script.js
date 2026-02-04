// Quiz Application Script
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
let questionAnswers = []; // Track user answers

// Define category mapping
const categories = {
    "Programming": 18,
    "English": 10,
    "History": 23,
    "Entertainment": 11
};

// Explanations database for common questions
const explanationDatabase = {
    "python function def": "In Python, the 'def' keyword is used to create a function. It stands for 'define' and is followed by the function name and parameters in parentheses. The other keywords (func, void, static) are used in different languages.",
    "default": "This is the correct answer! Pay attention to why other options are incorrect to better understand the concept."
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
        selectedCategory = btn.innerText.trim().split('\n')[1] || btn.innerText.trim();
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

// Customised alert
function showToast(message = "Quiz App says... Please wait or Try again later.") {
    let toast = document.createElement('div');
    toast.className = 'toast-popup';
    toast.textContent = message;
    document.body.appendChild(toast);
    toast.style.display = 'block';

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Start quiz
startButton.addEventListener("click", async () => {
    const categoryId = categories[selectedCategory];
    const url = `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=${categoryId}&difficulty=easy&type=multiple`;

    showToast("🚀 Loading your quiz...");

    try {
        const res = await fetch(url);
        const data = await res.json();

        questions = data.results;
        if (!questions || questions.length === 0) throw new Error("No questions fetched!");

        configContainer.style.display = "none";
        quizContainer.style.display = "block";
        currentQuestionIndex = 0;
        score = 0;
        questionAnswers = [];
        showQuestion();
    } catch (error) {
        console.error("API fetch error:", error);
        showToast("❌ Failed to load quiz. Please try again.");
    }
});

// Show question
function showQuestion() {
    const q = questions[currentQuestionIndex];
    const questionElem = document.querySelector(".question");
    const optionsContainer = document.querySelector(".quiz-content");
    const questionStatus = document.querySelector(".ques-status");
    const explanationBox = document.querySelector(".explanation-box");
    const remarkBox = document.querySelector(".remark-box");
    const progressFill = document.querySelector(".progress-fill");

    // Update progress bar
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressFill.style.width = progress + "%";

    // Clear old options and explanation
    optionsContainer.querySelectorAll(".answer-option").forEach(e => e.remove());
    explanationBox.classList.add("hidden");
    remarkBox.classList.add("hidden");

    // Set question text
    questionElem.innerHTML = decodeHTML(q.question);

    // Prepare and shuffle options
    const answers = [
        ...q.incorrect_answers.map(a => ({ text: decodeHTML(a), correct: false })),
        { text: decodeHTML(q.correct_answer), correct: true }
    ];
    shuffle(answers);

    // Add answers to DOM
    answers.forEach((ans, index) => {
        const ul = document.createElement("ul");
        ul.className = "answer-option";
        ul.innerHTML = `
            <li class="answer" data-correct="${ans.correct}" data-index="${index}">
                <p>${ans.text}</p>
            </li>`;
        optionsContainer.appendChild(ul);
    });

    questionStatus.innerHTML = `<b>${currentQuestionIndex + 1}</b> of <b>${questions.length}</b> Questions`;

    // Add event listeners to answers
    document.querySelectorAll(".answer").forEach(btn => {
        btn.addEventListener("click", () => handleAnswerClick(btn));
    });

    startTimer(timePerQuestion);
}

// Handle answer click
function handleAnswerClick(btn) {
    const allAnswers = document.querySelectorAll(".answer");
    const isCorrect = btn.dataset.correct === "true";
    
    // Prevent multiple clicks
    allAnswers.forEach(opt => opt.classList.add("disabled"));

    // Record answer
    questionAnswers.push({
        questionIndex: currentQuestionIndex,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        btn.classList.add("correct");
        score++;
        showExplanation(true);
    } else {
        btn.classList.add("incorrect");
        // Show correct answer
        allAnswers.forEach(opt => {
            if (opt.dataset.correct === "true") {
                opt.classList.add("correct");
            }
        });
        showExplanation(false);
    }

    clearInterval(timer);
}

function showExplanation(isCorrect) {
    const explanationBox = document.querySelector(".explanation-box");
    const remarkBox = document.querySelector(".remark-box");
    const q = questions[currentQuestionIndex];
    explanationBox.classList.add("hidden");
    remarkBox.classList.add("hidden");
    
    if (isCorrect) {
        // Show remark for correct answer
        remarkBox.classList.remove("hidden");
        const remarkText = document.querySelector(".remark-text");
        
        const remarks = [
            "Excellent! You understood the concept perfectly.💯👌",
            "Perfect! You nailed this one.⭐🎉",
            "Spot on! Great knowledge!⭐💯",
            "Absolutely correct! Well done!👍👏",
            "You got it! Keep up the great work!⭐👍",
            "Fantastic! You're on a roll!🎉✨",
            "Brilliant answer! Keep going!👏🎊"
        ];
        
        const randomRemark = remarks[Math.floor(Math.random() * remarks.length)];
        remarkText.textContent = randomRemark;
    } else {
        // Show explanation for incorrect answer
        explanationBox.classList.remove("hidden");
        const explanationText = document.querySelector(".explanation-text");
        
        const correctAnswer = decodeHTML(q.correct_answer);
        let explanation = `❌ Incorrect answer! The correct answer is: <strong>"${correctAnswer}"</strong>. `;
        explanation += `This is an important concept to remember for similar questions in the future.`;
        
        explanationText.innerHTML = explanation;
    }
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
        
        // Change timer color as time runs out
        const timerContainer = document.querySelector(".quiz-timer");
        if (timeLeft <= 5) {
            timerContainer.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
        } else {
            timerContainer.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            // Show Time's Up modal
            timerExpired = true;
            showTimeUpModal();
        }
        
    }, 1000);
}


// Show Time's Up Modal
function showTimeUpModal() {
    const modalOverlay = document.querySelector(".modal-overlay");
    modalOverlay.classList.remove("hidden");
    
    // Disable all answer buttons
    const allAnswers = document.querySelectorAll(".answer");
    allAnswers.forEach(opt => opt.classList.add("disabled"));
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

    // Calculate all statistics
    const totalQuestions = questions.length;
    const correctAnswers = score;
    const incorrectAnswers = totalQuestions - score;
    const percentage = (score / totalQuestions) * 100;
    const grade = getGrade(percentage);

    // Update score display
    document.querySelector(".score-text").innerHTML = `${correctAnswers}<br><span style="font-size: 1rem; font-weight: 500;">/ ${totalQuestions}</span>`;
    document.querySelector(".score-percentage").textContent = `${Math.round(percentage)}%`;
    
    // Set grade and color
    const gradeElement = document.querySelector(".score-grade");
    gradeElement.textContent = grade;
    gradeElement.className = `score-grade grade-${grade.toLowerCase()}`;

    const starRating = document.querySelector(".star-rating");
    const ratingText = document.querySelector(".rating-text");
    const { stars, text } = getPerformanceRating(percentage);
    starRating.textContent = stars;
    ratingText.textContent = text;

    // Update result message
    document.querySelector(".result-message").textContent = getResultMessage(percentage);

    // Update detailed statistics
    document.querySelector(".correct-count").textContent = `${correctAnswers}/${totalQuestions}`;
    document.querySelector(".incorrect-count").textContent = `${incorrectAnswers}/${totalQuestions}`;
    document.querySelector(".percentage-score").textContent = `${Math.round(percentage)}%`;

    // Update progress bars
    const correctPercentage = (correctAnswers / totalQuestions) * 100;
    const incorrectPercentage = (incorrectAnswers / totalQuestions) * 100;
    document.querySelector(".correct-bar").style.width = correctPercentage + "%";
    document.querySelector(".incorrect-bar").style.width = incorrectPercentage + "%";

    // Calculate time taken (approximate)
    const totalTime = totalQuestions * timePerQuestion;
    document.querySelector(".time-taken").textContent = `~${totalTime}s`;

    // Update insights
    updateInsights(percentage, correctAnswers, totalQuestions);

    // Trigger confetti for perfect score
    if (percentage === 100) {
        triggerConfetti();
    }
}

function getGrade(percentage) {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
}

// Get performance feedback
function getPerformanceRating(percentage) {
    if (percentage === 100) {
        return { stars: "⭐⭐⭐⭐⭐", text: "Perfect! You're a Quiz Master!" };
    } else if (percentage >= 90) {
        return { stars: "⭐⭐⭐⭐⭐", text: "Excellent Performance!" };
    } else if (percentage >= 80) {
        return { stars: "⭐⭐⭐⭐", text: "Great Job!" };
    } else if (percentage >= 70) {
        return { stars: "⭐⭐⭐", text: "Good Effort!" };
    } else if (percentage >= 60) {
        return { stars: "⭐⭐", text: "Keep Practicing!" };
    } else {
        return { stars: "⭐", text: "More Practice Needed!" };
    }
}

function getResultMessage(percentage) {
    if (percentage === 100) {
        return "🎯 Perfect Score! Congratulations!";
    } else if (percentage >= 90) {
        return "🌟 Excellent! You're Almost Perfect!";
    } else if (percentage >= 80) {
        return "👏 Great Job! Very Impressive!";
    } else if (percentage >= 70) {
        return "💪 Good Effort! Keep it Up!";
    } else if (percentage >= 60) {
        return "📚 Nice Try! You're Getting Better!";
    } else {
        return "🌱 Keep Practicing! You Got This!";
    }
}

// Update insights based on performance
function updateInsights(percentage, correctAnswers, totalQuestions) {
    const strengthText = document.querySelector(".strength-text");
    const improvementText = document.querySelector(".improvement-text");
    const tipText = document.querySelector(".tip-text");

    if (percentage === 100) {
        strengthText.textContent = "You're a quiz master! Perfect score achieved!";
        improvementText.textContent = "No weak areas! Keep maintaining this excellence!";
        tipText.textContent = "Try harder quizzes to further challenge yourself!";
    } else if (percentage >= 80) {
        strengthText.textContent = `You got ${correctAnswers} out of ${totalQuestions} correct. Great understanding!`;
        improvementText.textContent = `Focus on the ${totalQuestions - correctAnswers} questions you missed.`;
        tipText.textContent = "Review the concepts and try again to improve further!";
    } else if (percentage >= 60) {
        strengthText.textContent = `You answered ${correctAnswers} questions correctly. Good foundation!`;
        improvementText.textContent = `${totalQuestions - correctAnswers} questions need more attention.`;
        tipText.textContent = "Study the material and come back to challenge yourself again!";
    } else {
        strengthText.textContent = "You gave it a try! That's the first step to learning.";
        improvementText.textContent = `Most questions (${totalQuestions - correctAnswers}/${totalQuestions}) need review.`;
        tipText.textContent = "Go through the basics, then retry to see improvement!";
    }
}


// Trigger confetti animation (simple version)
function triggerConfetti() {
    const confettiPieces = 50;
    const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444'];
    
    for (let i = 0; i < confettiPieces; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '1000';
        
        document.body.appendChild(confetti);

        const duration = Math.random() * 3 + 2;
        const fall = anime.animate ? anime({
            targets: confetti,
            translateY: window.innerHeight + 20,
            opacity: [1, 0],
            duration: duration * 1000,
            easing: 'easeInQuad'
        }).finished : Promise.resolve().then(() => {
            setTimeout(() => confetti.remove(), duration * 1000);
        });
    }
}

// Retry quiz
retryButton.addEventListener("click", () => {
    configContainer.style.display = "block";
    quizContainer.style.display = "none";
    resultContainer.style.display = "none";
});

// Modal OK button listener
const modalOkBtn = document.querySelector(".modal-ok-btn");
if (modalOkBtn) {
    modalOkBtn.addEventListener("click", () => {
        const modalOverlay = document.querySelector(".modal-overlay");
        modalOverlay.classList.add("hidden");
        timerExpired = false;
        nextButton.click();
    });
}

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

// Add keyboard navigation
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && quizContainer.style.display === "block") {
        const disabled = document.querySelector(".answer.disabled");
        if (disabled) {
            nextButton.click();
        }
    }
});