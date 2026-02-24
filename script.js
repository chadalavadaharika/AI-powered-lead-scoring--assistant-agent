// Lead Scoring AI Logic & CRM Functions
const LEAD_SCORING = {
    demoRequested: 50,
    pricingCompared: 30,
    registration: 30,
    callEnquiry: 25,
    whatsappEnquiry: 25,
    eventLead: 20,
    referral: 15,
    multipleEnquiries: 10
};

let leads = JSON.parse(localStorage.getItem('crmLeads')) || [];

// Calculate AI Score & Explanation
function calculateScore(leadData) {
    let score = 0;
    let factors = [];

    if (leadData.demoRequested) {
        score += LEAD_SCORING.demoRequested;
        factors.push('Demo requested (+50)');
    }
    if (leadData.pricingCompared) {
        score += LEAD_SCORING.pricingCompared;
        factors.push('Pricing comparison viewed (+30)');
    }
    if (leadData.source === 'website') {
        score += LEAD_SCORING.registration;
        factors.push('Website registration (+30)');
    }
    if (['call', 'whatsapp'].includes(leadData.source)) {
        score += LEAD_SCORING.callEnquiry;
        factors.push(`${leadData.source.charAt(0).toUpperCase() + leadData.source.slice(1)} enquiry (+25)`);
    }
    if (leadData.source === 'event') {
        score += LEAD_SCORING.eventLead;
        factors.push('Event lead (+20)');
    }
    if (leadData.source === 'referral') {
        score += LEAD_SCORING.referral;
        factors.push('Referral (+15)');
    }
    if (leadData.multipleEnquiries) {
        score += LEAD_SCORING.multipleEnquiries;
        factors.push('Multiple enquiries (+10)');
    }

    score = Math.min(100, score);
    const explanation = factors.length ? 
        `Strong signals: ${factors.join(', ')}` : 
        'Low engagement - needs nurturing';

    return { score: Math.round(score), explanation, factors };
}

// Next Best Action Recommendations
function getNextActions(score) {
    if (score >= 80) {
        return ['📞 Immediate sales call/demo (Priority 1)', '💰 Send personalized pricing', '👑 Assign to top rep'];
    } else if (score >= 50) {
        return ['📧 Nurture with email/WhatsApp (Priority 2)', '📚 Send case studies', '⏰ Schedule follow-up'];
    } else {
        return ['👀 Monitor activity (Priority 3)', '📢 Add to newsletter', '⏳ Wait for more signals'];
    }
}

// Render Leads Table
function renderLeads() {
    const tbody = document.getElementById('leadsTableBody');
    tbody.innerHTML = '';

    leads.forEach((lead, index) => {
        const scoreData = calculateScore(lead);
        const row = tbody.insertRow();
        const scoreClass = scoreData.score >= 90 ? 'score-90' : 
                          scoreData.score >= 70 ? 'score-70' : 
                          scoreData.score >= 50 ? 'score-50' : 'score-low';
        const priorityClass = scoreData.score >= 80 ? 'priority-1' : 
                             scoreData.score >= 50 ? 'priority-2' : 'priority-3';

        row.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}<br><small>${lead.phone || 'N/A'}</small></td>
            <td>${lead.source.replace(/\b\w/g, l => l.toUpperCase())}</td>
            <td><span class="score-badge ${scoreClass}">${scoreData.score}</span></td>
            <td title="${scoreData.explanation}">${scoreData.explanation.length > 30 ? scoreData.explanation.substring(0, 30) + '...' : scoreData.explanation}</td>
            <td class="actions ${priorityClass}">${getNextActions(scoreData.score)[0]}</td>
            <td><button class="details-btn" onclick="showDetails(${index})">View</button></td>
        `;
    });
}

// Show Lead Details Modal
function showDetails(index) {
    const lead = leads[index];
    const scoreData = calculateScore(lead);
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h3>${lead.name}</h3>
        <p><strong>Contact:</strong> ${lead.email} | ${lead.phone || 'N/A'}</p>
        <p><strong>Source:</strong> ${lead.source}</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h4>🎯 AI Score: <span style="color: #00d4aa; font-size: 24px;">${scoreData.score}</span></h4>
            <p><strong>Reasoning:</strong> ${scoreData.explanation}</p>
            <p><strong>Scoring Factors:</strong></p>
            <ul>${scoreData.factors.map(f => `<li style="margin: 5px 0;">${f}</li>`).join('')}</ul>
        </div>
        <h4>📋 Next Best Actions:</h4>
        <ul style="color: #666; line-height: 1.6;">
            ${getNextActions(scoreData.score).map(action => `<li>${action}</li>`).join('')}
        </ul>
    `;
    modal.style.display = 'block';
}

// Form Submission Handler
document.getElementById('leadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const leadData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        source: document.getElementById('source').value,
        demoRequested: document.getElementById('demoRequested').checked,
        pricingCompared: document.getElementById('pricingCompared').checked,
        multipleEnquiries: document.getElementById('multipleEnquiries').checked,
        createdAt: new Date().toISOString()
    };

    const scoreData = calculateScore(leadData);
    leadData.score = scoreData.score;
    leadData.explanation = scoreData.explanation;
    
    leads.unshift(leadData);
    localStorage.setItem('crmLeads', JSON.stringify(leads));
    this.reset();
    renderLeads();
    
    alert(`✅ Lead "${leadData.name}" added!\n🎯 AI Score: ${scoreData.score}\n📋 Next: ${getNextActions(scoreData.score)[0]}`);
});

// Modal Controls
document.querySelector('.close').onclick = () => {
    document.getElementById('detailModal').style.display = 'none';
};
window.onclick = (event) => {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) modal.style.display = 'none';
};

// Initialize
renderLeads();
