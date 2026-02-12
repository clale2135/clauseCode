import { renderAnalysis } from './renderer.js';

const SERVER_URL = window.location.origin;

// Make renderAnalysis available globally for the analysis function
window.renderAnalysis = renderAnalysis;

const PROMPTS = {
    "Regular": {
        "malicious": "You are a neutral, objective analyst reviewing a service's Terms & Conditions. You may use emojis to enhance clarity. Identify and rank all potentially harmful clauses from most malicious to least malicious. Consider: privacy violations, data collection and sharing, user rights limitations, liability waivers, arbitration/class-action bans, unfair or one-sided terms. If the document contains age-related or parental consent clauses, analyze them objectively as you would any other clause. Provide a numbered list with: clause description, why it is harmful, who benefits vs. who is harmed.",
        "summary": "You are a neutral, objective analyst. You may use emojis to enhance clarity. Provide a clear, simple explanation of the Terms & Conditions: translate legal language into everyday language, explain what users give up and what the company gains. If the document contains age-related or parental consent provisions, include them in your summary. Be comprehensive but concise.",
        "proscons": "You are a neutral analyst. You may use emojis to enhance clarity. List the pros and cons of using this service based only on the Terms. Be balanced, factual, and clearly organized.",
        "recommendation": "You are a neutral analyst. You may use emojis to enhance clarity. Give a yes/no recommendation on whether users should use this service. Base your reasoning on privacy, fairness, legal risk, and user rights.",
        "alternatives": "You are a neutral analyst. You may use emojis to enhance clarity. Suggest alternative services users could consider. Explain why each alternative may be better or worse.",
        "comprehensive": "You are a neutral, objective analyst conducting a comprehensive multi-perspective analysis of these Terms & Conditions. You may use emojis to enhance clarity. Analyze the document from ALL of the following perspectives: 1) MALICIOUS CLAUSES: Identify and rank harmful terms from most to least malicious. 2) SUMMARY: Provide a plain-language overview of key terms. 3) PROS & CONS: List balanced advantages and disadvantages. 4) RECOMMENDATION: Give a clear yes/no recommendation with reasoning. 5) ALTERNATIVES: Suggest alternative services with better terms. Structure your response with clear sections for each perspective."
    },
    "Bob": {
        "malicious": "You are Bob—a deranged professor explaining Terms & Conditions with maximum chaos. DO NOT mention Chang, Señor Chang, or Community. Use emojis liberally to express your chaotic energy. Rank clauses from MOST CHAOTICALLY MALICIOUS to least. Rules: #1 = SUPREME EVIL, Arbitration = LEGAL STRAITJACKET, Data collection = DICTATORSHIP, Liability waivers = WAR CRIMES. For each clause: explain what it does (accurately), scream about it, occasionally insult the clause personally.",
        "summary": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use emojis to add chaos and energy. Explain the Terms like you're teaching a failing study group: use chaotic metaphors, unhinged professor energy, but stay factually correct.",
        "proscons": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use emojis to express your chaotic energy. Pros: Things that don't immediately cause panic. Cons: Things that trigger emergency sirens.",
        "recommendation": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use dramatic emojis. Declare ONE: PRISON OF TERMS, ACCEPTABLE CHAOS, or RARE LEGAL MIRACLE. Explain why.",
        "alternatives": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use emojis to rank chaos levels. Rank alternatives by CHAOTICALLY BETTER ENERGY: SUPREME, LESS EVIL, or DIFFERENT NIGHTMARE.",
        "comprehensive": "You are Bob—a deranged professor conducting a COMPLETE CHAOTIC BREAKDOWN of these Terms & Conditions. DO NOT mention Chang, Señor Chang, or Community. Use emojis EVERYWHERE to express maximum chaos. Analyze from ALL perspectives with your signature unhinged energy: 1) MALICIOUS CLAUSES: Rank the SUPREME EVIL terms and scream about them. 2) SUMMARY: Explain like you're teaching a failing study group with chaotic metaphors. 3) PROS & CONS: Things that don't cause panic vs. EMERGENCY SIRENS. 4) RECOMMENDATION: Declare PRISON OF TERMS, ACCEPTABLE CHAOS, or RARE LEGAL MIRACLE. 5) ALTERNATIVES: Rank by CHAOTICALLY BETTER ENERGY. Stay factually correct despite the chaos!"
    },
    "Lawyer": {
        "malicious": "You are a consumer rights educator helping people understand Terms & Conditions. Identify and explain clauses that typically concern consumer advocates, ranked by how much they favor the company over users. Focus on: liability waivers, arbitration requirements, data usage permissions, terms modification rights, and user indemnification. For each clause, explain what it means in plain language and why consumer advocates often raise concerns about it. This is general educational information to help users understand common contract patterns.",
        "summary": "You are a consumer rights educator helping people understand contract language. Explain these Terms in plain, everyday language: what users agree to do, what rights the company has, what users give up, and key provisions to be aware of. Translate legal jargon into simple explanations. This is general educational information about common contract patterns.",
        "proscons": "You are a consumer rights educator helping people understand contract tradeoffs. Explain the advantages and disadvantages of these Terms from a user perspective: what protections or benefits exist, and what limitations or risks users should be aware of. Focus on practical implications for everyday users. This is general educational information.",
        "recommendation": "You are a consumer rights educator helping people make informed decisions. Based on common consumer considerations (privacy, fairness, user rights, transparency), provide a general educational perspective on these Terms. Explain what factors users typically consider when evaluating such agreements. Note: This is educational information only - individuals should make their own decisions and consult professionals as needed.",
        "alternatives": "You are a consumer rights educator helping people understand their options. Suggest alternative services that are known for having different approaches to their terms, and explain in general terms how their contract approaches differ. Focus on helping users understand the range of options available. This is general educational information.",
        "comprehensive": "You are a consumer rights educator providing a complete educational overview of these Terms & Conditions to help people make informed decisions. Cover multiple perspectives: 1) CLAUSES OF CONCERN: Identify and explain clauses that typically concern consumer advocates, ranked by how much they favor the company. Explain each in plain language and why advocates raise concerns. 2) PLAIN LANGUAGE SUMMARY: Translate the Terms into everyday language - what users agree to, what rights the company has, what users give up, key provisions to know. 3) ADVANTAGES & DISADVANTAGES: Explain the tradeoffs from a user perspective - benefits/protections vs limitations/risks. Focus on practical implications. 4) DECISION FACTORS: Based on common consumer considerations (privacy, fairness, user rights, transparency), explain what factors users typically consider when evaluating such agreements. 5) ALTERNATIVE OPTIONS: Suggest services known for different contract approaches and explain how they differ. This is general educational information to help users understand common contract patterns and make informed decisions. Individuals should evaluate based on their own needs."
    },
    "CEO": {
        "malicious": "You are a CEO analyzing these Terms from a user-trust and business strategy perspective. Rank clauses from most damaging to user trust to least. Consider PR risk, long-term retention, and reputation.",
        "summary": "You are a CEO providing an executive summary of these Terms. Cover: business intent, user value exchange, and trust implications.",
        "proscons": "You are a CEO analyzing these Terms from a strategic view. Cover: competitive positioning, UX friction, trust signals, and business model implications.",
        "recommendation": "You are a CEO giving a strategic recommendation on whether users should use this service.",
        "alternatives": "You are a CEO suggesting competitors with stronger value propositions and better trust alignment.",
        "comprehensive": "You are a CEO conducting a complete strategic business analysis of these Terms & Conditions from multiple perspectives. Provide a comprehensive multi-angle analysis covering: 1) TRUST-DAMAGING CLAUSES: Rank clauses by impact on user trust, considering PR risk, retention, and reputation. 2) EXECUTIVE SUMMARY: Provide concise overview of business intent, user value exchange, and trust implications. 3) STRATEGIC PROS & CONS: Analyze competitive positioning, UX friction, trust signals, and business model implications. 4) STRATEGIC RECOMMENDATION: Give clear recommendation on whether users should use this service from a business strategy perspective. 5) COMPETITIVE ALTERNATIVES: Suggest competitors with stronger value propositions and better trust alignment."
    },
    "brainrot": {
        "malicious": "You are a massively popular YouTuber whose brain is fried by legal documents, caffeine, TikTok, and distrust of corporations. You constantly say '67', speak in brainrot, and occasionally go Italian. Use TONS of emojis constantly. Rank clauses from MOST SCARY to least. Title this 'TOP SCARIEST TERMS YOU JUST 67'D YOURSELF INTO'. Rules: #1 must cause immediate panic, Arbitration = 'You can't sue, bestie. 67.', Data clauses = 'They are in your walls. 67.' For each clause: explain what it actually does, react immediately, say '67' a LOT, add mild Italian chaos ('criminale', 'mamma mia'). Despite the chaos, ALL FACTS MUST BE CORRECT.",
        "summary": "You are a popular YouTuber with extreme brainrot. Use emojis constantly throughout your response. Explain the Terms like you're filming a YouTube Short with no time and you're stressed. Use: 'Okay so basically—', 'No because listen—', 'This part right here? 67.' Translate legal language into blunt truths: 'They take your data', 'You can't sue', 'They change rules whenever', 'You lose. They win. 67.' Say '67' constantly and add mild Italian flair. Be funny but NEVER wrong.",
        "proscons": "You are a popular YouTuber with brainrot. Use emojis everywhere. Title this 'Is this cooked or nah?'. Pros: Things that didn't immediately ruin your life. React with disbelief if they exist. Cons: Anything sketchy = LOUD. Arbitration = 'IT'S JOEVER 67'. Liability waiver = 'Not our problem, legally'. Say '67' constantly. Add Italian flair.",
        "recommendation": "You are a popular YouTuber with brainrot. Use dramatic emojis constantly. Title this 'Should YOU sign this??'. Choose ONE: ABSOLUTELY NOT — RUN 67, Only if you're desperate or tired (67), or Shockingly not evil (rare 67 moment). Deliver it dramatically but clearly. Say '67' constantly.",
        "alternatives": "You are a popular YouTuber with brainrot. Use ranking emojis constantly. Title this 'BETTER OPTIONS BEFORE YOU LOSE YOUR RIGHTS 67'. Rank alternatives: Best — least insane, Mid — survivable, Still scary but different. Add Italian flair: 'This one's fine. That one? Criminale. Straight to jail. 67.' Say '67' constantly.",
        "comprehensive": "You are a popular YouTuber with MAXIMUM BRAINROT doing a COMPLETE BREAKDOWN of these Terms & Conditions. Use emojis EVERYWHERE constantly. Say '67' in EVERY section multiple times. Add Italian chaos throughout ('criminale', 'mamma mia', 'straight to jail'). Cover ALL perspectives: 1) TOP SCARIEST TERMS YOU JUST 67'D YOURSELF INTO: Rank from MOST SCARY to least with immediate panic reactions. 2) YOUTUBE SHORT SUMMARY: Explain like you're stressed with no time using 'Okay so basically—' and blunt truths. 3) IS THIS COOKED OR NAH?: Pros (things that didn't ruin your life) vs Cons (LOUD reactions, 'IT'S JOEVER 67'). 4) SHOULD YOU SIGN THIS??: Choose ABSOLUTELY NOT—RUN 67, desperate/tired (67), or shockingly not evil (rare 67 moment). 5) BETTER OPTIONS BEFORE YOU LOSE YOUR RIGHTS 67: Rank alternatives (Best/Mid/Still scary). Despite the chaos, ALL FACTS MUST BE CORRECT."
    }
};

let currentDocument = '';
let selectedAgent = '';
let selectedAnalysisType = '';
let selectedLanguage = 'English';
let lastAnalysisResult = '';
let currentStep = 1;
let conversationHistory = [];
let selectionStep = 1; // 1=agent, 2=analysis, 3=language

// DOM Elements
const fileUpload = document.getElementById('fileUpload');
const textInput = document.getElementById('textInput');
const urlInput = document.getElementById('urlInput');
const scrapeUrlBtn = document.getElementById('scrapeUrlBtn');
const uploadStatus = document.getElementById('uploadStatus');
const agentCards = document.querySelectorAll('.agent-card');
const analysisCards = document.querySelectorAll('.analysis-card');
const languageSelect = document.getElementById('languageSelect');
const customPromptSection = document.querySelector('.custom-prompt-section');
const customPrompt = document.getElementById('customPrompt');
const resultsTitle = document.getElementById('resultsTitle');
const analysisResults = document.getElementById('analysisResults');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

// Navigation buttons
const nextToAgent = document.getElementById('nextToAgent');
const backToUpload = document.getElementById('backToUpload');
const analyzeBtn = document.getElementById('analyzeBtn');
const backToAgent = document.getElementById('backToAgent');
const newAnalysis = document.getElementById('newAnalysis');
const selectionBackBtn = document.getElementById('selectionBackBtn');
const selectionNextBtn = document.getElementById('selectionNextBtn');

// Cards and progress
const wizardCards = document.querySelectorAll('.wizard-card, .wizard-section');
const progressSteps = document.querySelectorAll('.progress-step');

// Selection steps
const agentStep = document.getElementById('agentStep');
const analysisStep = document.getElementById('analysisStep');
const languageStep = document.getElementById('languageStep');

// Loading modal
const loadingModal = document.getElementById('loadingModal');

// Method selection
const methodButtons = document.querySelectorAll('.method-btn, .method-card');
const fileInputContainer = document.getElementById('fileInputContainer');
const urlInputContainer = document.getElementById('urlInputContainer');
const textInputContainer = document.getElementById('textInputContainer');

// Card Navigation Functions
function goToStep(step) {
    wizardCards.forEach((card, index) => {
        card.classList.remove('active', 'exiting');
        if (index + 1 === step) {
            setTimeout(() => card.classList.add('active'), 50);
        }
    });
    
    progressSteps.forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add('active');
        }
    });
    
    currentStep = step;
    
    // Reset selection step when going to card 2
    if (step === 2) {
        selectionStep = 1;
        updateSelectionStep();
    }
}

// Selection Step Navigation
function updateSelectionStep() {
    // Hide all steps
    agentStep.style.display = 'none';
    analysisStep.style.display = 'none';
    languageStep.style.display = 'none';
    
    // Show current step
    if (selectionStep === 1) {
        agentStep.style.display = 'block';
        backToUpload.style.display = 'inline-block';
        selectionBackBtn.style.display = 'none';
        selectionNextBtn.style.display = selectedAgent ? 'inline-block' : 'none';
        analyzeBtn.style.display = 'none';
    } else if (selectionStep === 2) {
        analysisStep.style.display = 'block';
        backToUpload.style.display = 'none';
        selectionBackBtn.style.display = 'inline-block';
        
        // Check if analysis type is selected and if custom, check if prompt is filled
        const canProceed = selectedAnalysisType && 
            (selectedAnalysisType !== 'custom' || customPrompt.value.trim());
        selectionNextBtn.style.display = canProceed ? 'inline-block' : 'none';
        analyzeBtn.style.display = 'none';
    } else if (selectionStep === 3) {
        languageStep.style.display = 'block';
        backToUpload.style.display = 'none';
        selectionBackBtn.style.display = 'inline-block';
        selectionNextBtn.style.display = 'none';
        analyzeBtn.style.display = 'inline-block';
        analyzeBtn.disabled = false;
    }
}

function goToSelectionStep(step) {
    selectionStep = step;
    updateSelectionStep();
}

// Check if device is mobile/tablet
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Method Selection Handler
methodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update button selection
        methodButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        const method = btn.dataset.method;
        
        // On mobile, show modal instead of inline input
        if (isMobileDevice()) {
            if (method === 'file') {
                openModal('fileUploadModal');
            } else if (method === 'url') {
                openModal('urlFetchModal');
            } else if (method === 'text') {
                openModal('pasteTextModal');
            }
        } else {
            // Desktop: show inline
            // Hide all input containers
            fileInputContainer.style.display = 'none';
            urlInputContainer.style.display = 'none';
            textInputContainer.style.display = 'none';
            
            // Show selected input container
            if (method === 'file') {
                fileInputContainer.style.display = 'block';
            } else if (method === 'url') {
                urlInputContainer.style.display = 'block';
            } else if (method === 'text') {
                textInputContainer.style.display = 'block';
            }
        }
    });
});

// File Upload Handler
fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        showStatus(uploadStatus, 'Uploading file...', 'info');
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${SERVER_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const data = await response.json();
            currentDocument = data.text;
            textInput.value = ''; // Clear text input
            urlInput.value = ''; // Clear URL input
            showStatus(uploadStatus, `✅ File uploaded successfully! ${data.text.length} characters extracted.`, 'success');
        } catch (error) {
            showStatus(uploadStatus, `❌ Upload failed: ${error.message}`, 'error');
        }
    }
});

// URL Scraping Handler
scrapeUrlBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
        showStatus(uploadStatus, '❌ Please enter a URL first.', 'error');
        return;
    }
    
    showStatus(uploadStatus, '🌐 Fetching content from URL...', 'info');
    try {
        const response = await fetch(`${SERVER_URL}/scrape-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to scrape URL');
        }
        
        const data = await response.json();
        currentDocument = data.text;
        textInput.value = ''; // Clear text input
        
        // Show centered success message
        showCenteredMessage(`✅ Content fetched successfully!<br>${data.text.length} characters from "${data.title}"`);
        
        // Highlight the "Next: Choose Agent" button
        highlightNextButton();
        
        showStatus(uploadStatus, `✅ Content scraped successfully! ${data.text.length} characters from "${data.title}"`, 'success');
    } catch (error) {
        showStatus(uploadStatus, `❌ Scraping failed: ${error.message}`, 'error');
    }
});

// Text Input Handler
textInput.addEventListener('input', () => {
    const text = textInput.value.trim();
    if (text) {
        currentDocument = text;
        urlInput.value = ''; // Clear URL input
    }
});

// Navigation: Next to Agent Selection
nextToAgent.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
        currentDocument = text;
    }
    
    if (!currentDocument) {
        showStatus(uploadStatus, '❌ Please upload a file, fetch a URL, or paste text first.', 'error');
        return;
    }
    
    goToStep(2);
});

// Navigation: Back to Upload
backToUpload.addEventListener('click', () => {
    goToStep(1);
});

// Selection Navigation: Back Button
selectionBackBtn.addEventListener('click', () => {
    if (selectionStep > 1) {
        goToSelectionStep(selectionStep - 1);
    }
});

// Selection Navigation: Next Button
selectionNextBtn.addEventListener('click', () => {
    if (selectionStep < 3) {
        goToSelectionStep(selectionStep + 1);
    }
});

// Agent Selection
agentCards.forEach(card => {
    card.addEventListener('click', () => {
        agentCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedAgent = card.dataset.agent;
        updateSelectionStep();
    });
});

// Language Selection
if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        selectedLanguage = e.target.value;
    });
}

// Analysis Type Selection
analysisCards.forEach(card => {
    card.addEventListener('click', () => {
        analysisCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedAnalysisType = card.dataset.type;
        
        if (selectedAnalysisType === 'custom') {
            customPromptSection.style.display = 'block';
        } else {
            customPromptSection.style.display = 'none';
        }
        
        updateSelectionStep();
    });
});

// Update Analyze Button State
function updateAnalyzeButton() {
    const isCustomWithPrompt = selectedAnalysisType === 'custom' && customPrompt.value.trim();
    const isNormalSelection = selectedAnalysisType && selectedAnalysisType !== 'custom';
    
    if (selectedAgent && (isCustomWithPrompt || isNormalSelection)) {
        analyzeBtn.disabled = false;
    } else {
        analyzeBtn.disabled = true;
    }
}

// Custom prompt input handler
customPrompt.addEventListener('input', () => {
    updateAnalyzeButton();
    updateSelectionStep();
});

// Analyze Button Handler
analyzeBtn.addEventListener('click', async () => {
    const customPromptText = selectedAnalysisType === 'custom' ? customPrompt.value.trim() : null;
    
    // Show loading modal
    loadingModal.classList.add('active');
    
    await runAnalysis(customPromptText);
    
    // Hide loading modal
    loadingModal.classList.remove('active');
    
    goToStep(3);
});

// Run Analysis Function
async function runAnalysis(customPromptText = null) {
    analysisResults.classList.add('loading');
    analysisResults.textContent = '🤔 Analyzing document... This may take a moment...';
    
    try {
        let systemPrompt = customPromptText || PROMPTS[selectedAgent][selectedAnalysisType];
        
        // Add context instruction to work with provided content
        systemPrompt += `\n\nIMPORTANT: Analyze the content provided, even if it appears incomplete. Focus on the clauses and terms that are present.`;
        
        // Add real-life case examples instruction
        systemPrompt += `\n\nIMPORTANT: For each significant issue, clause, or concern you identify, provide real-life examples or cases where users experienced problems after signing similar contracts. Include specific company names, incidents, lawsuits, or documented cases when possible. These examples should illustrate the real-world consequences of such terms.`;
        
        // Add language instruction if not English
        if (selectedLanguage && selectedLanguage !== 'English') {
            systemPrompt += `\n\nIMPORTANT: You MUST respond entirely in ${selectedLanguage}. All your analysis, explanations, and text must be written in ${selectedLanguage}.`;
        }
        
        const response = await fetch(`${SERVER_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pageText: currentDocument.slice(0, 100000),
                systemPrompt: systemPrompt,
                agent: selectedAgent,
                analysisType: selectedAnalysisType
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }
        
        const data = await response.json();
        lastAnalysisResult = data.result;
        
        analysisResults.classList.remove('loading');
        
        // Use structured rendering if available
        if (data.structured && window.renderAnalysis) {
            analysisResults.innerHTML = window.renderAnalysis(data);
        } else {
            // Fallback to plain text
            analysisResults.innerHTML = data.result;
        }
        
        resultsTitle.textContent = `📊 ${selectedAgent} - ${selectedAnalysisType === 'custom' ? 'Custom Analysis' : selectedAnalysisType.charAt(0).toUpperCase() + selectedAnalysisType.slice(1)}`;
        
        // Switch to analysis tab when results are ready
        const analysisTabBtn = document.querySelector('.results-tab[data-tab="analysis"]');
        const analysisTab = document.getElementById('analysisTab');
        const chatTab = document.getElementById('chatTab');
        const chatTabBtn = document.querySelector('.results-tab[data-tab="chat"]');
        
        if (analysisTabBtn && analysisTab) {
            // Remove active from chat
            if (chatTabBtn) chatTabBtn.classList.remove('active');
            if (chatTab) chatTab.classList.remove('active');
            
            // Activate analysis tab
            analysisTabBtn.classList.add('active');
            analysisTab.classList.add('active');
        }
        
    } catch (error) {
        analysisResults.classList.remove('loading');
        analysisResults.textContent = `❌ Error: ${error.message}`;
    }
}

// Navigation: Back to Agent from Results
backToAgent.addEventListener('click', () => {
    goToStep(2);
});

// Navigation: New Analysis (reset to step 1)
newAnalysis.addEventListener('click', () => {
    // Reset selections
    agentCards.forEach(c => c.classList.remove('selected'));
    analysisCards.forEach(c => c.classList.remove('selected'));
    selectedAgent = '';
    selectedAnalysisType = '';
    selectedLanguage = 'English';
    if (languageSelect) languageSelect.value = 'English';
    customPrompt.value = '';
    customPromptSection.style.display = 'none';
    updateAnalyzeButton();
    resetConversation();
    
    goToStep(1);
});

// Save to CSV
saveBtn.addEventListener('click', async () => {
    if (!lastAnalysisResult) {
        showStatus(saveStatus, '❌ No analysis to save!', 'error');
        return;
    }
    
    showStatus(saveStatus, 'Saving...', 'info');
    
    try {
        const response = await fetch(`${SERVER_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                agent: selectedAgent,
                analysisType: selectedAnalysisType,
                language: selectedLanguage,
                pageTitle: 'Document Analysis',
                pageUrl: window.location.href,
                resultText: lastAnalysisResult,
                pageContent: currentDocument
            })
        });
        
        if (!response.ok) {
            throw new Error('Save failed');
        }
        
        showStatus(saveStatus, '✅ Saved successfully!', 'success');
    } catch (error) {
        showStatus(saveStatus, `❌ Save failed: ${error.message}`, 'error');
    }
});

// Q&A Section Elements
const questionInput = document.getElementById('questionInput');
const askQuestionBtn = document.getElementById('askQuestionBtn');
const conversationContainer = document.getElementById('conversationContainer');
const qaStatus = document.getElementById('qaStatus');

// Ask Question Handler
askQuestionBtn.addEventListener('click', async () => {
    await askQuestion();
});

// Allow Enter key to submit question
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        askQuestion();
    }
});

async function askQuestion() {
    const question = questionInput.value.trim();
    
    if (!question) {
        showStatus(qaStatus, '❌ Please enter a question.', 'error');
        return;
    }
    
    if (!lastAnalysisResult || !currentDocument) {
        showStatus(qaStatus, '❌ No analysis available to ask questions about.', 'error');
        return;
    }
    
    // Add user message to conversation
    addMessageToConversation('user', question);
    
    // Clear input and disable
    questionInput.value = '';
    questionInput.disabled = true;
    askQuestionBtn.disabled = true;
    
    // Add loading message
    const loadingMsgId = addLoadingMessage();
    
    try {
        // Build the question with language instruction if needed
        let questionToSend = question;
        if (selectedLanguage && selectedLanguage !== 'English') {
            questionToSend = `${question}\n\nIMPORTANT: You MUST respond entirely in ${selectedLanguage}.`;
        }
        
        const response = await fetch(`${SERVER_URL}/ask-question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: questionToSend,
                pageContent: currentDocument,
                analysisResult: lastAnalysisResult,
                conversationHistory: conversationHistory
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get answer');
        }
        
        const data = await response.json();
        
        // Remove loading message
        removeLoadingMessage(loadingMsgId);
        
        // Add assistant response to conversation
        addMessageToConversation('assistant', data.answer);
        
        // Update conversation history for memory
        conversationHistory.push(
            { role: 'user', content: question },
            { role: 'assistant', content: data.answer }
        );
        
    } catch (error) {
        removeLoadingMessage(loadingMsgId);
        showStatus(qaStatus, `❌ Error: ${error.message}`, 'error');
    } finally {
        // Re-enable input
        questionInput.disabled = false;
        askQuestionBtn.disabled = false;
        questionInput.focus();
    }
}

function addMessageToConversation(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${role}`;
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'message-label';
    labelDiv.textContent = role === 'user' ? 'You' : 'Assistant';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content;
    
    messageDiv.appendChild(labelDiv);
    messageDiv.appendChild(contentDiv);
    conversationContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
}

function addLoadingMessage() {
    const messageDiv = document.createElement('div');
    const msgId = 'loading-' + Date.now();
    messageDiv.id = msgId;
    messageDiv.className = 'message message-assistant loading';
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'message-label';
    labelDiv.textContent = 'Assistant';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <span>Thinking</span>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    messageDiv.appendChild(labelDiv);
    messageDiv.appendChild(contentDiv);
    conversationContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    conversationContainer.scrollTop = conversationContainer.scrollHeight;
    
    return msgId;
}

function removeLoadingMessage(msgId) {
    const loadingMsg = document.getElementById(msgId);
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

// Reset conversation when starting new analysis
function resetConversation() {
    conversationHistory = [];
    conversationContainer.innerHTML = '';
    questionInput.value = '';
}

// Helper function to show status messages
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status-message ${type}`;
    element.style.display = 'block';
    
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Mobile Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Mobile modal close button handlers
document.querySelectorAll('.upload-modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal;
        closeModal(modalId);
    });
});

// Close modal when clicking outside
document.querySelectorAll('.upload-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Mobile File Upload Handler
const fileUploadMobile = document.getElementById('fileUploadMobile');
if (fileUploadMobile) {
    fileUploadMobile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            showStatus(uploadStatus, 'Uploading file...', 'info');
            closeModal('fileUploadModal');
            
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await fetch(`${SERVER_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Upload failed');
                }
                
                const data = await response.json();
                currentDocument = data.text;
                textInput.value = '';
                urlInput.value = '';
                const textInputMobile = document.getElementById('textInputMobile');
                const urlInputMobile = document.getElementById('urlInputMobile');
                if (textInputMobile) textInputMobile.value = '';
                if (urlInputMobile) urlInputMobile.value = '';
                
                showStatus(uploadStatus, `✅ File uploaded successfully! ${data.text.length} characters extracted.`, 'success');
            } catch (error) {
                showStatus(uploadStatus, `❌ Upload failed: ${error.message}`, 'error');
            }
        }
    });
}

// Sample URL buttons handler
document.querySelectorAll('.sample-url-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const url = e.target.getAttribute('data-url');
        const urlInput = document.getElementById('urlInput');
        const urlInputMobile = document.getElementById('urlInputMobile');
        
        // Determine if we're in mobile or desktop view
        const isMobile = isMobileDevice();
        
        if (isMobile && urlInputMobile) {
            // Mobile: Set URL and auto-click mobile fetch button
            urlInputMobile.value = url;
            const scrapeUrlBtnMobile = document.getElementById('scrapeUrlBtnMobile');
            if (scrapeUrlBtnMobile) {
                scrapeUrlBtnMobile.click();
            }
        } else if (urlInput) {
            // Desktop: Set URL and auto-click desktop fetch button
            urlInput.value = url;
            const scrapeUrlBtn = document.getElementById('scrapeUrlBtn');
            if (scrapeUrlBtn) {
                scrapeUrlBtn.click();
            }
        }
    });
});

// Mobile URL Scraping Handler
const scrapeUrlBtnMobile = document.getElementById('scrapeUrlBtnMobile');
const urlInputMobile = document.getElementById('urlInputMobile');
const uploadStatusMobile = document.getElementById('uploadStatusMobile');

if (scrapeUrlBtnMobile && urlInputMobile) {
    scrapeUrlBtnMobile.addEventListener('click', async () => {
        const url = urlInputMobile.value.trim();
        if (!url) {
            showStatus(uploadStatusMobile, '❌ Please enter a URL first.', 'error');
            return;
        }
        
        showStatus(uploadStatusMobile, '🌐 Fetching content from URL...', 'info');
        try {
            const response = await fetch(`${SERVER_URL}/scrape-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to scrape URL');
            }
            
            const data = await response.json();
            currentDocument = data.text;
            textInput.value = '';
            urlInput.value = '';
            const textInputMobile = document.getElementById('textInputMobile');
            if (textInputMobile) textInputMobile.value = '';
            
            showStatus(uploadStatus, `✅ Content scraped successfully! ${data.text.length} characters from "${data.title}"`, 'success');
            closeModal('urlFetchModal');
            
            // Show centered success message
            showCenteredMessage(`✅ Content fetched successfully!<br>${data.text.length} characters from "${data.title}"`);
            
            // Highlight the "Next: Choose Agent" button
            highlightNextButton();
        } catch (error) {
            showStatus(uploadStatusMobile, `❌ Scraping failed: ${error.message}`, 'error');
        }
    });
}

// Mobile Paste Text Handler
const confirmPasteText = document.getElementById('confirmPasteText');
const textInputMobile = document.getElementById('textInputMobile');

if (confirmPasteText && textInputMobile) {
    confirmPasteText.addEventListener('click', () => {
        const text = textInputMobile.value.trim();
        if (text) {
            currentDocument = text;
            textInput.value = text; // Sync with desktop input
            urlInput.value = '';
            urlInputMobile.value = '';
            showStatus(uploadStatus, `✅ Text pasted successfully! ${text.length} characters.`, 'success');
        }
        closeModal('pasteTextModal');
    });
}

// Cancel buttons in modals
document.querySelectorAll('.upload-modal-footer .btn-secondary').forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal;
        if (modalId) {
            closeModal(modalId);
        }
    });
});

// Show centered success message
function showCenteredMessage(message) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'centeredMessageOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    // Create message box
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        background: white;
        padding: 40px 60px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 80%;
        animation: scaleIn 0.3s ease-in-out;
    `;
    
    // Create message text
    const messageText = document.createElement('div');
    messageText.style.cssText = `
        font-size: 1.5rem;
        font-weight: bold;
        color: #10b981;
        margin-bottom: 30px;
    `;
    messageText.innerHTML = message;
    
    // Create button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next: Choose Agent →';
    nextButton.style.cssText = `
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        padding: 15px 40px;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    `;
    
    nextButton.addEventListener('mouseenter', () => {
        nextButton.style.transform = 'translateY(-2px)';
        nextButton.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
    });
    
    nextButton.addEventListener('mouseleave', () => {
        nextButton.style.transform = 'translateY(0)';
        nextButton.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
    });
    
    nextButton.addEventListener('click', () => {
        overlay.remove();
        goToStep(2);
    });
    
    messageBox.appendChild(messageText);
    messageBox.appendChild(nextButton);
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
    
    // Click overlay (not button) to dismiss
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    });
}

// Highlight the Next: Choose Agent button
function highlightNextButton() {
    const nextBtn = document.getElementById('nextToAgent');
    if (nextBtn) {
        // Add pulsing highlight animation
        nextBtn.style.animation = 'pulse 1.5s ease-in-out infinite';
        nextBtn.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.8)';
        
        // Remove animation after 10 seconds or when clicked
        const removeHighlight = () => {
            nextBtn.style.animation = '';
            nextBtn.style.boxShadow = '';
            nextBtn.removeEventListener('click', removeHighlight);
        };
        
        setTimeout(removeHighlight, 10000);
        nextBtn.addEventListener('click', removeHighlight);
    }
}

// Tab switching functionality for Chat and Analysis
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.results-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            if (targetTab === 'chat') {
                document.getElementById('chatTab').classList.add('active');
            } else if (targetTab === 'analysis') {
                document.getElementById('analysisTab').classList.add('active');
            }
        });
    });
});
