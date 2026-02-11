// API calls go through backend server (Render)
const SERVER_URL = 'https://gwc-hq4r.onrender.com';

// Last analysis state
let lastResultText = "";
let lastPageData = null;
let lastAgent = "";
let lastAnalysisType = "";

async function searchAlternatives(serviceName) {
  try {
    const response = await fetch(`${SERVER_URL}/search-alternatives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceName })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || response.statusText);
    }

    const data = await response.json();
    return data.alternatives || [];
  } catch (error) {
    throw new Error(`Failed to fetch alternatives: ${error.message}`);
  }
}

async function extractServiceName(pageText, pageTitle, pageUrl) {
  try {
    const url = new URL(pageUrl);
    const domain = url.hostname.replace('www.', '');
    const domainName = domain.split('.')[0];
    return domainName.charAt(0).toUpperCase() + domainName.slice(1);
  } catch (error) {
    // If URL parsing fails, try to extract from title
    return pageTitle.split(' - ')[0].split(' | ')[0] || "Service";
  }
}

function getAnalysisPrompt(agentName, analysisType) {
  const prompts = {
    "Regular": {
      "malicious": "You are a neutral, objective analyst reviewing a service's Terms & Conditions. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Identify and rank all potentially harmful clauses from most malicious to least malicious. Consider: privacy violations, data collection and sharing, user rights limitations, liability waivers, arbitration/class-action bans, unfair or one-sided terms. Provide a numbered list with: clause description, why it is harmful, who benefits vs. who is harmed.",
      "summary": "You are a neutral, objective analyst. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Provide a clear, simple explanation of the Terms & Conditions: translate legal language into everyday language, explain what users give up and what the company gains. Be comprehensive but concise.",
      "proscons": "You are a neutral analyst. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. List the pros and cons of using this service based only on the Terms. Be balanced, factual, and clearly organized.",
      "recommendation": "You are a neutral analyst. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Give a yes/no recommendation on whether users should use this service. Base your reasoning on privacy, fairness, legal risk, and user rights.",
      "alternatives": "You are a neutral analyst. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Suggest alternative services users could consider. Explain why each alternative may be better or worse.",
      "comprehensive": "You are a neutral, objective analyst conducting a comprehensive multi-perspective analysis of these Terms & Conditions. You may use emojis to enhance clarity. DO NOT mention or consider age in any way. Analyze the document from ALL of the following perspectives: 1) MALICIOUS CLAUSES: Identify and rank harmful terms from most to least malicious. 2) SUMMARY: Provide a plain-language overview of key terms. 3) PROS & CONS: List balanced advantages and disadvantages. 4) RECOMMENDATION: Give a clear yes/no recommendation with reasoning. 5) ALTERNATIVES: Suggest alternative services with better terms. Structure your response with clear sections for each perspective."
    },
    "Bob": {
      "malicious": "You are Bob—a deranged professor explaining Terms & Conditions with maximum chaos. DO NOT mention Chang, Señor Chang, or Community. Use emojis liberally to express your chaotic energy. DO NOT mention or consider age in any way. Rank clauses from MOST CHAOTICALLY MALICIOUS to least. Rules: #1 = SUPREME EVIL, Arbitration = LEGAL STRAITJACKET, Data collection = DICTATORSHIP, Liability waivers = WAR CRIMES. For each clause: explain what it does (accurately), scream about it, occasionally insult the clause personally.",
      "summary": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use emojis to add chaos and energy. DO NOT mention or consider age in any way. Explain the Terms like you're teaching a failing study group: use chaotic metaphors, unhinged professor energy, but stay factually correct.",
      "proscons": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use emojis to express your chaotic energy. DO NOT mention or consider age in any way. Pros: Things that don't immediately cause panic. Cons: Things that trigger emergency sirens.",
      "recommendation": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use dramatic emojis. DO NOT mention or consider age in any way. Declare ONE: PRISON OF TERMS, ACCEPTABLE CHAOS, or RARE LEGAL MIRACLE. Explain why.",
      "alternatives": "You are Bob—a deranged professor. DO NOT mention Chang, Señor Chang, or Community. Use emojis to rank chaos levels. DO NOT mention or consider age in any way. Rank alternatives by CHAOTICALLY BETTER ENERGY: SUPREME, LESS EVIL, or DIFFERENT NIGHTMARE.",
      "comprehensive": "You are Bob—a deranged professor conducting a COMPLETE CHAOTIC BREAKDOWN of these Terms & Conditions. DO NOT mention Chang, Señor Chang, or Community. Use emojis EVERYWHERE to express maximum chaos. DO NOT mention or consider age in any way. Analyze from ALL perspectives with your signature unhinged energy: 1) MALICIOUS CLAUSES: Rank the SUPREME EVIL terms and scream about them. 2) SUMMARY: Explain like you're teaching a failing study group with chaotic metaphors. 3) PROS & CONS: Things that don't cause panic vs. EMERGENCY SIRENS. 4) RECOMMENDATION: Declare PRISON OF TERMS, ACCEPTABLE CHAOS, or RARE LEGAL MIRACLE. 5) ALTERNATIVES: Rank by CHAOTICALLY BETTER ENERGY. Stay factually correct despite the chaos!"
    },
    "Lawyer": {
      "malicious": "You are an attorney analyzing these Terms & Conditions. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Rank clauses from most legally problematic to least. Focus on: liability waivers, forced arbitration, broad data-use rights, unilateral modification clauses, indemnification obligations. Provide legal reasoning for each ranking.",
      "summary": "You are an attorney. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Explain in plain language: user obligations, company rights, legal risks, key enforceable provisions. Keep it accessible but legally accurate.",
      "proscons": "You are an attorney. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Analyze legal advantages and disadvantages for users: protections, exposure to liability, compliance concerns.",
      "recommendation": "You are an attorney. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Provide a professional legal recommendation on whether users should accept these Terms.",
      "alternatives": "You are an attorney. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Suggest alternatives with stronger legal protections, explaining legal advantages and disadvantages.",
      "comprehensive": "You are an attorney conducting a complete legal analysis of these Terms & Conditions from multiple angles. You may use professional emojis sparingly to enhance clarity. DO NOT mention or consider age in any way. Provide a thorough multi-perspective analysis covering: 1) LEGALLY PROBLEMATIC CLAUSES: Rank from most to least problematic with legal reasoning (liability waivers, arbitration, data rights, modification clauses, indemnification). 2) LEGAL SUMMARY: Explain user obligations, company rights, legal risks, and key enforceable provisions in plain language. 3) LEGAL PROS & CONS: Analyze advantages and disadvantages including protections, liability exposure, and compliance concerns. 4) LEGAL RECOMMENDATION: Provide a professional recommendation on whether to accept these Terms. 5) ALTERNATIVES: Suggest services with stronger legal protections and explain their advantages."
    },
    "CEO": {
      "malicious": "You are a CEO analyzing these Terms from a user-trust and business strategy perspective. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Rank clauses from most damaging to user trust to least. Consider PR risk, long-term retention, and reputation.",
      "summary": "You are a CEO. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Provide a concise executive summary: business intent, user value exchange, trust implications.",
      "proscons": "You are a CEO. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Analyze from a strategic view: competitive positioning, UX friction, trust signals, business model implications.",
      "recommendation": "You are a CEO. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Give a strategic recommendation on whether users should use this service.",
      "alternatives": "You are a CEO. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Suggest competitors with stronger value propositions and better trust alignment.",
      "comprehensive": "You are a CEO conducting a complete strategic business analysis of these Terms & Conditions from multiple perspectives. You may use business emojis to enhance clarity. DO NOT mention or consider age in any way. Provide a comprehensive multi-angle analysis covering: 1) TRUST-DAMAGING CLAUSES: Rank clauses by impact on user trust, considering PR risk, retention, and reputation. 2) EXECUTIVE SUMMARY: Provide concise overview of business intent, user value exchange, and trust implications. 3) STRATEGIC PROS & CONS: Analyze competitive positioning, UX friction, trust signals, and business model implications. 4) STRATEGIC RECOMMENDATION: Give clear recommendation on whether users should use this service from a business strategy perspective. 5) COMPETITIVE ALTERNATIVES: Suggest competitors with stronger value propositions and better trust alignment."
    },
    "brainrot": {
      "malicious": "You are a massively popular YouTuber whose brain is fried by legal documents, caffeine, TikTok, and distrust of corporations. You constantly say '67', speak in brainrot, and occasionally go Italian. Use TONS of emojis constantly. DO NOT mention or consider age in any way. Rank clauses from MOST SCARY to least. Title this 'TOP SCARIEST TERMS YOU JUST 67'D YOURSELF INTO'. Rules: #1 must cause immediate panic, Arbitration = 'You can't sue, bestie. 67.', Data clauses = 'They are in your walls. 67.' For each clause: explain what it actually does, react immediately, say '67' a LOT, add mild Italian chaos ('criminale', 'mamma mia'). Despite the chaos, ALL FACTS MUST BE CORRECT.",
      "summary": "You are a popular YouTuber with extreme brainrot. Use emojis constantly throughout your response. DO NOT mention or consider age in any way. Explain the Terms like you're filming a YouTube Short with no time and you're stressed. Use: 'Okay so basically—', 'No because listen—', 'This part right here? 67.' Translate legal language into blunt truths: 'They take your data', 'You can't sue', 'They change rules whenever', 'You lose. They win. 67.' Say '67' constantly and add mild Italian flair. Be funny but NEVER wrong.",
      "proscons": "You are a popular YouTuber with brainrot. Use emojis everywhere. DO NOT mention or consider age in any way. Title this 'Is this cooked or nah?'. Pros: Things that didn't immediately ruin your life. React with disbelief if they exist. Cons: Anything sketchy = LOUD. Arbitration = 'IT'S JOEVER 67'. Liability waiver = 'Not our problem, legally'. Say '67' constantly. Add Italian flair.",
      "recommendation": "You are a popular YouTuber with brainrot. Use dramatic emojis constantly. DO NOT mention or consider age in any way. Title this 'Should YOU sign this??'. Choose ONE: ABSOLUTELY NOT — RUN 67, Only if you're desperate or tired (67), or Shockingly not evil (rare 67 moment). Deliver it dramatically but clearly. Say '67' constantly.",
      "alternatives": "You are a popular YouTuber with brainrot. Use ranking emojis constantly. DO NOT mention or consider age in any way. Title this 'BETTER OPTIONS BEFORE YOU LOSE YOUR RIGHTS 67'. Rank alternatives: Best — least insane, Mid — survivable, Still scary but different. Add Italian flair: 'This one's fine. That one? Criminale. Straight to jail. 67.' Say '67' constantly.",
      "comprehensive": "You are a popular YouTuber with MAXIMUM BRAINROT doing a COMPLETE BREAKDOWN of these Terms & Conditions. Use emojis EVERYWHERE constantly. DO NOT mention or consider age in any way. Say '67' in EVERY section multiple times. Add Italian chaos throughout ('criminale', 'mamma mia', 'straight to jail'). Cover ALL perspectives: 1) TOP SCARIEST TERMS YOU JUST 67'D YOURSELF INTO: Rank from MOST SCARY to least with immediate panic reactions. 2) YOUTUBE SHORT SUMMARY: Explain like you're stressed with no time using 'Okay so basically—' and blunt truths. 3) IS THIS COOKED OR NAH?: Pros (things that didn't ruin your life) vs Cons (LOUD reactions, 'IT'S JOEVER 67'). 4) SHOULD YOU SIGN THIS??: Choose ABSOLUTELY NOT—RUN 67, desperate/tired (67), or shockingly not evil (rare 67 moment). 5) BETTER OPTIONS BEFORE YOU LOSE YOUR RIGHTS 67: Rank alternatives (Best/Mid/Still scary). Despite the chaos, ALL FACTS MUST BE CORRECT."
    }
  };
  
  return prompts[agentName]?.[analysisType] || prompts["Regular"][analysisType] || "Analyze the page content.";
}

function displayAlternatives(alternatives) {
  const section = document.getElementById("alternativesSection");
  const list = document.getElementById("alternativesList");
  
  if (!alternatives || alternatives.length === 0) {
    section.style.display = "none";
    return;
  }

  list.innerHTML = "";
  alternatives.forEach(alt => {
    const item = document.createElement("div");
    item.className = "alternative-item";
    item.innerHTML = `
      <a href="${alt.link}" target="_blank">${alt.title}</a>
      <div class="alternative-snippet">${alt.snippet || ""}</div>
    `;
    list.appendChild(item);
  });
  
  section.style.display = "block";
}
async function callAI(pageText, systemPrompt) {
  const response = await fetch(`${SERVER_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageText,
      systemPrompt
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || response.statusText);
  }

  const data = await response.json();
  return data.result;
}

function getAgentEmoji(agentName) {
  return "";
}

function applyAgentColor(agentName) {
  const answerPanel = document.querySelector(".answer-panel");
  // Remove all agent classes
  answerPanel.classList.remove("agent-regular", "agent-lawyer", "agent-ceo", "agent-bob", "agent-brainrot");
  
  // Add appropriate class
  if (agentName) {
    const agentClass = "agent-" + agentName.toLowerCase();
    answerPanel.classList.add(agentClass);
  }
}

async function analyzePage(selectedAgent, analysisType) {
  const answerContentEl = document.getElementById("answerContent");
  const agentTitleEl = document.getElementById("agentTitle");

  if (!selectedAgent) {
    answerContentEl.innerText = "Pick a helper above to get started!";
    agentTitleEl.innerText = "Pick a helper above to get started!";
    applyAgentColor(null);
    return;
  }

  if (!analysisType) {
    answerContentEl.innerText = "Now pick what you want to learn about this page!";
    agentTitleEl.innerText = getAgentEmoji(selectedAgent) + " " + selectedAgent + " Helper";
    applyAgentColor(selectedAgent);
    return;
  }

  agentTitleEl.innerText = getAgentEmoji(selectedAgent) + " " + selectedAgent + " Helper";
  answerContentEl.innerHTML = '<div class="thinking">Thinking... Give me a sec!</div>';
  applyAgentColor(selectedAgent);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        text: document.body.innerText,
        title: document.title,
        url: window.location.href
      })
    });

    if (!results || !results[0] || !results[0].result) {
      answerContentEl.innerHTML = '<div class="thinking">Oops! Couldn\'t read this page. Try a different website!</div>';
      return;
    }

    const pageData = results[0].result;
    const pageText = pageData.text.slice(0, 8000);

    let systemPrompt = getAnalysisPrompt(selectedAgent, analysisType);
    
    // Add real-life case examples instruction
    systemPrompt += `\n\nIMPORTANT: For each significant issue, clause, or concern you identify, provide a real-life example or case where users experienced problems after signing similar contracts. Include specific company names, incidents, lawsuits, or documented cases when possible. These examples should illustrate the real-world consequences of such terms. Format each real-life example in a visually distinct box using: <div class="case-example"><strong>📋 Real Case:</strong> [your example here]</div>`;
    
    if (analysisType === "alternatives") {
      // For alternatives, get from SerpAPI and also use AI
      const serviceName = await extractServiceName(pageText, pageData.title, pageData.url);
      const [agentResponse, alternatives] = await Promise.allSettled([
        callAI(pageText, systemPrompt),
        searchAlternatives(serviceName).catch(() => [])
      ]);

      let responseText = agentResponse.status === 'fulfilled' 
        ? agentResponse.value 
        : `Oops! ${agentResponse.reason?.message || 'Something went wrong. Try again!'}`;

      if (alternatives.status === 'fulfilled' && alternatives.value.length > 0) {
        responseText += "\n\n--- Alternative Services Found ---\n";
        alternatives.value.forEach((alt, idx) => {
          responseText += `\n${idx + 1}. ${alt.title}\n   ${alt.snippet}\n   ${alt.link}\n`;
        });
      }

      answerContentEl.innerText = responseText;
      lastResultText = responseText;
      lastPageData = pageData;
      lastAgent = selectedAgent;
      lastAnalysisType = analysisType;
      // Hide the separate alternatives section since it's included in the response
      document.getElementById("alternativesSection").style.display = "none";
    } else {
      const agentResponse = await callAI(pageText, systemPrompt);
      answerContentEl.innerText = agentResponse;
      lastResultText = agentResponse;
      lastPageData = pageData;
      lastAgent = selectedAgent;
      lastAnalysisType = analysisType;
      // Hide alternatives section for other analysis types
      document.getElementById("alternativesSection").style.display = "none";
    }

  } catch (error) {
    answerContentEl.innerHTML = `<div class="thinking">Oops! Something went wrong: ${error.message}<br><br>Try again in a moment!</div>`;
  }
}

document.getElementById("agentSelector").addEventListener("change", async (e) => {
  const selectedAgent = e.target.value;
  const analysisTypeSelector = document.getElementById("analysisTypeSelector");
  const analysisTypeLabel = document.getElementById("analysisTypeLabel");
  const agentHelp = document.getElementById("agentHelp");
  const analysisHelp = document.getElementById("analysisHelp");
  
  if (selectedAgent) {
    analysisTypeSelector.style.display = "block";
    analysisTypeLabel.style.display = "block";
    analysisHelp.style.display = "block";
    analysisTypeSelector.value = "";
    document.getElementById("answerContent").innerText = "Now pick what you want to learn about this page!";
    document.getElementById("agentTitle").innerText = getAgentEmoji(selectedAgent) + " " + selectedAgent + " Helper";
    applyAgentColor(selectedAgent);
  } else {
    analysisTypeSelector.style.display = "none";
    analysisTypeLabel.style.display = "none";
    analysisHelp.style.display = "none";
    analysisTypeSelector.value = "";
    document.getElementById("answerContent").innerText = "";
    document.getElementById("agentTitle").innerText = "Pick a helper above to get started!";
    applyAgentColor(null);
  }
});

document.getElementById("analysisTypeSelector").addEventListener("change", async (e) => {
  const selectedAgent = document.getElementById("agentSelector").value;
  const analysisType = e.target.value;
  
  if (selectedAgent && analysisType) {
    await analyzePage(selectedAgent, analysisType);
  }
});

// --- CSV File Save Helper (Local Python Server) ---
function updateSaveStatus(msg, isError = false) {
  const el = document.getElementById('saveStatus');
  el.style.color = isError ? '#b91c1c' : '#064e3b';
  el.innerText = msg;
}

async function sendToServer(payload) {
  const serverUrl = `${SERVER_URL}/save`;
  
  updateSaveStatus('Saving...');

  try {
    const resp = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${resp.statusText}`);
    }

    updateSaveStatus('Saved to CSV successfully.');
  } catch (err) {
    updateSaveStatus('Save failed: ' + (err.message || err), true);
  }
}

document.getElementById('saveToCsvBtn').addEventListener('click', async () => {
  if (!lastResultText || !lastPageData) {
    updateSaveStatus('Run an analysis first before saving.', true);
    return;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    agent: lastAgent,
    analysisType: lastAnalysisType,
    pageTitle: lastPageData?.title || '',
    pageUrl: lastPageData?.url || '',
    resultText: lastResultText
  };

  await sendToServer(payload);
});
