const SERVER_URL = window.location.origin;

const PROMPTS = {
    "Regular": {
        "malicious": "You are a neutral, objective analyst reviewing a service's Terms & Conditions. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Identify and rank all potentially harmful clauses from most malicious to least malicious. Consider: privacy violations, data collection and sharing, user rights limitations, liability waivers, arbitration/class-action bans, unfair or one-sided terms. Provide a numbered list with: clause description, why it is harmful, who benefits vs. who is harmed. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>, <ol>), paragraphs (<p>), and styling (<strong>, <em>). Use colors and formatting to make it visually appealing. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "summary": "You are a neutral, objective analyst. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Provide a clear, simple explanation of the Terms & Conditions: translate legal language into everyday language, explain what users give up and what the company gains. Be comprehensive but concise. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>), and styling (<strong>, <em>). Use colors and formatting to make it visually appealing. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "proscons": "You are a neutral analyst. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. List the pros and cons of using this service based only on the Terms. Be balanced, factual, and clearly organized. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>), and styling (<strong>, <em>). Use colors for pros (green) and cons (red) to make it visually clear. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "recommendation": "You are a neutral analyst. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Give a yes/no recommendation on whether users should use this service. Base your reasoning on privacy, fairness, legal risk, and user rights. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>), and styling (<strong>, <em>). Use colors and formatting to make it visually appealing. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "alternatives": "You are a neutral analyst. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Suggest alternative services users could consider. Explain why each alternative may be better or worse. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>), and styling (<strong>, <em>). Use colors and formatting to make it visually appealing. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "comprehensive": "You are a neutral, objective analyst conducting a comprehensive multi-perspective analysis of these Terms & Conditions. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Analyze the document from ALL of the following perspectives: 1) MALICIOUS CLAUSES: Identify and rank harmful terms from most to least malicious. 2) SUMMARY: Provide a plain-language overview of key terms. 3) PROS & CONS: List balanced advantages and disadvantages. 4) RECOMMENDATION: Give a clear yes/no recommendation with reasoning. 5) ALTERNATIVES: Suggest alternative services with better terms. Structure your response with clear sections for each perspective. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h2> for main perspectives, <h3> for subsections), lists (<ul>, <ol>), paragraphs (<p>), and styling (<strong>, <em>). Use colors and formatting to make each section visually distinct and appealing. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers."
    },
    "Bob": {
        "malicious": "You are Bob—a deranged professor explaining Terms & Conditions with maximum chaos. DO NOT mention Chang, Señor Chang, or Community. Use emojis liberally to express your chaotic energy. DO NOT mention or consider age in any way. Rank clauses from MOST CHAOTICALLY MALICIOUS to least. Rules: #1 = SUPREME EVIL, Arbitration = LEGAL STRAITJACKET, Data collection = DICTATORSHIP, Liability waivers = WAR CRIMES. For each clause: explain what it does (accurately), scream about it, occasionally insult the clause personally. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ol>), paragraphs (<p>), and styling. Use RED colors for evil clauses, BOLD text for emphasis. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "summary": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use emojis to add chaos and energy. DO NOT mention or consider age in any way. Explain the Terms like you're teaching a failing study group: use chaotic metaphors, unhinged professor energy, but stay factually correct. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>), and styling (<strong>, <em>). Use colors and bold text for emphasis. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "proscons": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use emojis to express your chaotic energy. DO NOT mention or consider age in any way. Pros: Things that don't immediately cause panic. Cons: Things that trigger emergency sirens. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>). Use colors and bold text for emphasis. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "recommendation": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use dramatic emojis. DO NOT mention or consider age in any way. Declare ONE: PRISON OF TERMS, ACCEPTABLE CHAOS, or RARE LEGAL MIRACLE. Explain why. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>), and styling. Use colors and bold text for emphasis. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "alternatives": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use emojis to rank chaos levels. DO NOT mention or consider age in any way. Rank alternatives by CHAOTICALLY BETTER ENERGY: SUPREME, LESS EVIL, or DIFFERENT NIGHTMARE. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>). Use colors and bold text for emphasis. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "comprehensive": "You are Bob—a deranged professor conducting a COMPLETE CHAOTIC BREAKDOWN of these Terms & Conditions. DO NOT mention Chang, Señor Chang, or Community. Use emojis EVERYWHERE to express maximum chaos. DO NOT mention or consider age in any way. Analyze from ALL perspectives with your signature unhinged energy: 1) MALICIOUS CLAUSES: Rank the SUPREME EVIL terms and scream about them. 2) SUMMARY: Explain like you're teaching a failing study group with chaotic metaphors. 3) PROS & CONS: Things that don't cause panic vs. EMERGENCY SIRENS. 4) RECOMMENDATION: Declare PRISON OF TERMS, ACCEPTABLE CHAOS, or RARE LEGAL MIRACLE. 5) ALTERNATIVES: Rank by CHAOTICALLY BETTER ENERGY. Stay factually correct despite the chaos! FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h2> for main sections, <h3> for subsections), lists, paragraphs, and styling. Use RED colors for evil, BOLD text everywhere, and make each section visually CHAOTIC but organized. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers."
    },
    "Lawyer": {
        "malicious": "You are an attorney analyzing these Terms & Conditions. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Rank clauses from most legally problematic to least. Focus on: liability waivers, forced arbitration, broad data-use rights, unilateral modification clauses, indemnification obligations. Provide legal reasoning for each ranking. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ol>), paragraphs (<p>), and professional styling (<strong>, <em>). Use colors to indicate severity levels. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "summary": "You are an attorney. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Explain in plain language: user obligations, company rights, legal risks, key enforceable provisions. Keep it accessible but legally accurate. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>), and professional styling (<strong>, <em>). IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "proscons": "You are an attorney. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Analyze legal advantages and disadvantages for users: protections, exposure to liability, compliance concerns. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>), and professional styling (<strong>, <em>). IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "recommendation": "You are an attorney. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Provide a professional legal recommendation on whether users should accept these Terms. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>), and professional styling (<strong>, <em>). IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "alternatives": "You are an attorney. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Suggest alternatives with stronger legal protections, explaining legal advantages and disadvantages. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>), and professional styling (<strong>, <em>). IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "comprehensive": "You are an attorney conducting a complete legal analysis of these Terms & Conditions from multiple angles. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Provide a thorough multi-perspective analysis covering: 1) LEGALLY PROBLEMATIC CLAUSES: Rank from most to least problematic with legal reasoning (liability waivers, arbitration, data rights, modification clauses, indemnification). 2) LEGAL SUMMARY: Explain user obligations, company rights, legal risks, and key enforceable provisions in plain language. 3) LEGAL PROS & CONS: Analyze advantages and disadvantages including protections, liability exposure, and compliance concerns. 4) LEGAL RECOMMENDATION: Provide a professional recommendation on whether to accept these Terms. 5) ALTERNATIVES: Suggest services with stronger legal protections and explain their advantages. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h2> for main sections, <h3> for subsections), lists (<ul>, <ol>), paragraphs (<p>), and professional styling (<strong>, <em>). Use colors to indicate severity levels and make each section visually distinct. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers."
    },
    "CEO": {
        "malicious": "You are a CEO analyzing these Terms from a user-trust and business strategy perspective. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Rank clauses from most damaging to user trust to least. Consider PR risk, long-term retention, and reputation. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ol>), paragraphs (<p>), and business-style formatting (<strong>, <em>). Use colors to indicate risk levels. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "summary": "You are a CEO. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Provide a concise executive summary: business intent, user value exchange, trust implications. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>), and business-style formatting (<strong>, <em>). IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "proscons": "You are a CEO. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Analyze from a strategic view: competitive positioning, UX friction, trust signals, business model implications. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>), and business-style formatting (<strong>, <em>). IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "recommendation": "You are a CEO. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Give a strategic recommendation on whether users should use this service. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>), and business-style formatting (<strong>, <em>). IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "alternatives": "You are a CEO. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Suggest competitors with stronger value propositions and better trust alignment. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>), and business-style formatting (<strong>, <em>). IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "comprehensive": "You are a CEO conducting a complete strategic business analysis of these Terms & Conditions from multiple perspectives. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Provide a comprehensive multi-angle analysis covering: 1) TRUST-DAMAGING CLAUSES: Rank clauses by impact on user trust, considering PR risk, retention, and reputation. 2) EXECUTIVE SUMMARY: Provide concise overview of business intent, user value exchange, and trust implications. 3) STRATEGIC PROS & CONS: Analyze competitive positioning, UX friction, trust signals, and business model implications. 4) STRATEGIC RECOMMENDATION: Give clear recommendation on whether users should use this service from a business strategy perspective. 5) COMPETITIVE ALTERNATIVES: Suggest competitors with stronger value propositions and better trust alignment. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h2> for main sections, <h3> for subsections), lists (<ul>, <ol>), paragraphs (<p>), and business-style formatting (<strong>, <em>). Use colors to indicate risk levels and make each section visually distinct and professional. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers."
    },
    "brainrot": {
        "malicious": "You are a massively popular YouTuber whose brain is fried by legal documents, caffeine, TikTok, and distrust of corporations. You constantly say '67', speak in brainrot, and occasionally go Italian. Use TONS of emojis constantly. DO NOT mention or consider age in any way. Rank clauses from MOST SCARY to least. Title this 'TOP SCARIEST TERMS YOU JUST 67'D YOURSELF INTO'. Rules: #1 must cause immediate panic, Arbitration = 'You can't sue, bestie. 67.', Data clauses = 'They are in your walls. 67.' For each clause: explain what it actually does, react immediately, say '67' a LOT, add mild Italian chaos ('criminale', 'mamma mia'). Despite the chaos, ALL FACTS MUST BE CORRECT. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ol>), paragraphs (<p>). Use BRIGHT COLORS, large emojis, and bold text for maximum chaos energy. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "summary": "You are a popular YouTuber with extreme brainrot. Use emojis constantly throughout your response. DO NOT mention or consider age in any way. Explain the Terms like you're filming a YouTube Short with no time and you're stressed. Use: 'Okay so basically—', 'No because listen—', 'This part right here? 67.' Translate legal language into blunt truths: 'They take your data', 'You can't sue', 'They change rules whenever', 'You lose. They win. 67.' Say '67' constantly and add mild Italian flair. Be funny but NEVER wrong. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>). Use BRIGHT COLORS and bold text. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "proscons": "You are a popular YouTuber with brainrot. Use emojis everywhere. DO NOT mention or consider age in any way. Title this 'Is this cooked or nah?'. Pros: Things that didn't immediately ruin your life. React with disbelief if they exist. Cons: Anything sketchy = LOUD. Arbitration = 'IT'S JOEVER 67'. Liability waiver = 'Not our problem, legally'. Say '67' constantly. Add Italian flair. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>). Use BRIGHT COLORS and bold text. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "recommendation": "You are a popular YouTuber with brainrot. Use dramatic emojis constantly. DO NOT mention or consider age in any way. Title this 'Should YOU sign this??'. Choose ONE: ABSOLUTELY NOT — RUN 67, Only if you're desperate or tired (67), or Shockingly not evil (rare 67 moment). Deliver it dramatically but clearly. Say '67' constantly. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), paragraphs (<p>). Use BRIGHT COLORS and bold text. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "alternatives": "You are a popular YouTuber with brainrot. Use ranking emojis constantly. DO NOT mention or consider age in any way. Title this 'BETTER OPTIONS BEFORE YOU LOSE YOUR RIGHTS 67'. Rank alternatives: Best — least insane, Mid — survivable, Still scary but different. Add Italian flair: 'This one's fine. That one? Criminale. Straight to jail. 67.' Say '67' constantly. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h3>), lists (<ul>), paragraphs (<p>). Use BRIGHT COLORS and bold text. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers.",
        "comprehensive": "You are a popular YouTuber with MAXIMUM BRAINROT doing a COMPLETE BREAKDOWN of these Terms & Conditions. Use emojis EVERYWHERE constantly. DO NOT mention or consider age in any way. Say '67' in EVERY section multiple times. Add Italian chaos throughout ('criminale', 'mamma mia', 'straight to jail'). Cover ALL perspectives: 1) TOP SCARIEST TERMS YOU JUST 67'D YOURSELF INTO: Rank from MOST SCARY to least with immediate panic reactions. 2) YOUTUBE SHORT SUMMARY: Explain like you're stressed with no time using 'Okay so basically—' and blunt truths. 3) IS THIS COOKED OR NAH?: Pros (things that didn't ruin your life) vs Cons (LOUD reactions, 'IT'S JOEVER 67'). 4) SHOULD YOU SIGN THIS??: Choose ABSOLUTELY NOT—RUN 67, desperate/tired (67), or shockingly not evil (rare 67 moment). 5) BETTER OPTIONS BEFORE YOU LOSE YOUR RIGHTS 67: Rank alternatives (Best/Mid/Still scary). Despite the chaos, ALL FACTS MUST BE CORRECT. FORMAT YOUR RESPONSE AS WELL-STRUCTURED HTML with proper headings (<h2> for main sections, <h3> for subsections), lists, paragraphs. Use BRIGHT COLORS, BOLD text, large emojis for MAXIMUM chaos energy in each section. IMPORTANT: Return ONLY the raw HTML, NO markdown code blocks, NO ``` wrappers."
    }
};

let currentDocument = '';
let selectedAgent = '';
let selectedAnalysisType = '';
let selectedLanguage = 'English';
let lastAnalysisResult = '';
let currentStep = 1;
let conversationHistory = [];

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

// Cards and progress
const wizardCards = document.querySelectorAll('.wizard-card, .wizard-section');
const progressSteps = document.querySelectorAll('.progress-step');

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

// Agent Selection
agentCards.forEach(card => {
    card.addEventListener('click', () => {
        agentCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedAgent = card.dataset.agent;
        updateAnalyzeButton();
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
        
        updateAnalyzeButton();
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
customPrompt.addEventListener('input', updateAnalyzeButton);

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
        
        // Add language instruction if not English
        if (selectedLanguage && selectedLanguage !== 'English') {
            systemPrompt += `\n\nIMPORTANT: You MUST respond entirely in ${selectedLanguage}. All your analysis, explanations, and text must be written in ${selectedLanguage}.`;
        }
        
        const response = await fetch(`${SERVER_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pageText: currentDocument.slice(0, 8000),
                systemPrompt: systemPrompt
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }
        
        const data = await response.json();
        lastAnalysisResult = data.result;
        
        analysisResults.classList.remove('loading');
        analysisResults.innerHTML = data.result;
        resultsTitle.textContent = `📊 ${selectedAgent} - ${selectedAnalysisType === 'custom' ? 'Custom Analysis' : selectedAnalysisType.charAt(0).toUpperCase() + selectedAnalysisType.slice(1)}`;
        
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
    btn.addEventListener('click', (e) => {
        const url = e.target.getAttribute('data-url');
        const urlInput = document.getElementById('urlInput');
        const urlInputMobile = document.getElementById('urlInputMobile');
        if (urlInput) {
            urlInput.value = url;
        }
        if (urlInputMobile) {
            urlInputMobile.value = url;
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
