const questions = [
    {
        question: "Erasmus’a neden gitmek istiyorsun?",
        answers: [
            { text: "Yeni yerler keşfetmek, bol bol gezmek. 🗺️ ", score: "A" },
            { text: " Farklı kültürleri deneyimlemek, arkadaşlıklar kurmak. 🤝", score: "B" },
            { text: "Akademik olarak gelişmek, kaliteli bir eğitim almak. 📚", score: "C" },
            { text: "Eğlenmek, gece hayatını yaşamak! 🎉", score: "D" }
        ]
    },
    {
        question: "Erasmus sırasında hangi etkinliklere katılmak istersin?",
        answers: [
            { text: "Şehir turlarına katılmak 🏰", score: "A" },
            { text: "Erasmus partilerine gitmek 🎶", score: "B" },
            { text: "Sanat galerilerini ve tiyatroları gezmek 🎭", score: "C" },
            { text: "Dağcılık, doğa yürüyüşü gibi aktiviteler yapmak ⛰️", score: "D" }
        ]
    },
    {
        question: "Erasmus’ta en çok hangisini denemek istersin?",
        answers: [
            { text: "Yeni diller öğrenmek 🗣️", score: "A" },
            { text: "Yeni mutfakları keşfetmek 🍝", score: "B" },
            { text: "Yerel kültürel etkinliklere katılmak 🎭", score: "C" },
            { text: "Festivallere ve partilere gitmek 🎶", score: "D" }
        ]
    },
    {
        question: "Yeni bir dili öğrenmek zorunda kalsan hangisini seçerdin?",
        answers: [
            { text: "İtalyanca veya Fransızca. 🇮🇹 🇫🇷", score: "A" },
            { text: "İspanyolca veya Portekizce. 🇪🇸 🇵🇹", score: "B" },
            { text: "Almanca veya Hollandaca. 🇩🇪 🇳🇱", score: "C" },
            { text: " Lehçe veya Çekçe. 🇵🇱 🇨🇿", score: "D" }
        ]
    },
    {
        question: "Erasmus’a gideceğin ülkenin hava durumu nasıl olmalı?",
        answers: [
            { text: "Ilık ve güneşli. ☀️🌿", score: "A" },
            { text: "Dört mevsimi yaşamak isterim. 🍂❄️🌸", score: "B" },
            { text: "Soğuk ama düzenli hava şartları. ❄️🌫️", score: "C" },
            { text: " Önemli değil, her koşula uyum sağlarım! 🌦️😊", score: "D" }
        ]
    },
    {
        question: "Erasmus deneyiminin sonunda kendini nasıl geliştirmek istersin?",
        answers: [
            { text: "Sanat ve tarih konusunda derinleşmek. 🎨🏛️", score: "A" },
            { text: "Eğlenceli anılar ve yeni arkadaşlar edinmek. 🎉👫", score: "B" },
            { text: " Mesleki ve akademik olarak güçlenmek. 🎓📖", score: "C" },
            { text: "  Farklı bir yaşam tarzına uyum sağlamak. 🌍💡", score: "D" }
        ]
    },
    {
        question: "Erasmus’ta en çok merak ettiğin şey ne?",
        answers: [
            { text: "Avrupa’nın kültürel mirasını keşfetmek. 🏰🖼️", score: "A" },
            { text: "Yeni insanlarla tanışıp sosyalleşmek. 🍻🎶", score: "B" },
            { text: " Akademik sistemin farklarını görmek. 🏫📚", score: "C" },
            { text: " Yeni bir ülkede yaşamayı deneyimlemek. 🏡✈️", score: "D" }
        ]
    },
    {
        question: "Erasmus yapacağın şehir nasıl bir yer olmalı?",
        answers: [
            { text: "Kültürel açıdan zengin ve tarihi bir şehir. 🏛️🖼️", score: "A" },
            { text: "Bol bol parti ve eğlence olmalı. 🎉🍹", score: "B" },
            { text: "Akademik ve araştırma odaklı olmalı. 📖🔬", score: "C" },
            { text: "Sessiz, sakin ve öğrenci dostu olmalı. 🌱🏡", score: "D" }
        ]
    },
    {
        question: "Erasmus şehrinde yemek konusunda en önemli kriterin ne?",
        answers: [
            { text: "Gurme lezzetler ve zengin mutfak kültürü. 🍝🥖", score: "A" },
            { text: "Uygun fiyatlı ve lezzetli sokak yemekleri. 🌮🥙", score: "B" },
            { text: "Vegan / vejetaryen seçeneklerin bol olması. 🥗🍵", score: "C" },
            { text: "Fast food ve market ürünleriyle idare ederim. 🍔🍟", score: "D" }
        ]
    },
];

let currentQuestionIndex = 0;
let answersSelected = [];

const modal = document.getElementById("testModal");
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-button");

function openModal() {
    modal.style.display = "flex";
    startTest();
}

function closeModal() {
    modal.style.display = "none";
}

function startTest() {
    currentQuestionIndex = 0;
    answersSelected = [];
    showQuestion();
}

function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    questionText.innerText = currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerText = answer.text;
        button.classList.add("answer-button");
        button.addEventListener("click", () => selectAnswer(answer.score));
        answerButtons.appendChild(button);
    });

    nextButton.style.display = "none";
}

function resetState() {
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function selectAnswer(score) {
    answersSelected.push(score);
    nextButton.style.display = "block";
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    resetState();
    questionText.innerText = "Sonuçlarınız hazır!";
    
    let result = calculateResult();
    let resultText = document.createElement("p");
    resultText.innerText = result;
    answerButtons.appendChild(resultText);
    
    nextButton.style.display = "none";
}

function calculateResult() {
    let A = answersSelected.filter(x => x === "A").length;
    let B = answersSelected.filter(x => x === "B").length;
    let C = answersSelected.filter(x => x === "C").length;
    let D = answersSelected.filter(x => x === "D").length;

    let maxScore = Math.max(A, B, C, D);

    if (A === maxScore && A !== B && A !== C && A !== D) 
        return "Senin için en iyi Erasmus ülkeleri: İSPANYA, İTALYA, PORTEKİZ, YUNANİSTAN! 🇪🇸🇮🇹🇵🇹🇬🇷 ☀️ Güneşli, sıcak ve eğlenceli bir Erasmus deneyimi seni bekliyor!";

    if (B === maxScore && B !== A && B !== C && B !== D) 
        return "Senin için en iyi Erasmus ülkeleri: ALMANYA, HOLLANDA, BELÇİKA, AVUSTURYA! 🇩🇪🇳🇱🇧🇪🇦🇹 📚 Akademik olarak güçlü ve düzenli şehirler tam sana göre!";

    if (C === maxScore && C !== A && C !== B && C !== D) 
        return "Senin için en iyi Erasmus ülkeleri: İSVEÇ, FİNLANDİYA, NORVEÇ, DANİMARKA! 🇸🇪🇫🇮🇳🇴🇩🇰 ❄️ Kaliteli eğitim ve doğayla iç içe bir deneyim için kuzeye gitmelisin!";

    if (D === maxScore && D !== A && D !== B && D !== C) 
        return "Senin için en iyi Erasmus ülkeleri: FRANSA, ÇEK CUMHURİYETİ, POLONYA, MACARİSTAN! 🇫🇷🇨🇿🇵🇱🇭🇺 🎭 Hem kültürel hem ekonomik Erasmus deneyimi için harika seçenekler!";

    return "Farklı tercihlere açıksın! MALTA, İRLANDA, SLOVENYA, ROMANYA gibi ülkeler de sana uygun olabilir! 🌍";
}
