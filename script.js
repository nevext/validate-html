// Inicializa observador para revelação suave de cards ao rolar

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.lead-card');

  // aplica estado inicial escondido
  cards.forEach(card => card.classList.add('hidden-card'));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // aplicar com pequeno delay para que a transição seja percebida
        setTimeout(() => entry.target.classList.add('show-card'), 50);
      } else {
        // quando sair da viewport, voltamos ao estado inicial para que a animação possa ocorrer novamente
        entry.target.classList.remove('show-card');
      }
    });
  }, {
    threshold: 0.1,          // quando ~10% do card estiver visível
    rootMargin: '0px 0px -10% 0px' // dispara um pouco antes de sair da viewport
  });

  cards.forEach(card => observer.observe(card));

  // leitor do link "Leia mais" para mostrar/fechar o cartão explicativo
  const heroLink = document.getElementById('hero-link');
  const infoCard = document.getElementById('info-card');
  const infoClose = document.getElementById('info-close');

  if (heroLink && infoCard) {
    heroLink.addEventListener('click', e => {
      e.preventDefault();
      infoCard.classList.add('show-card');
    });
  }
  // clicking the brand or hero title should return to main page (clear any params)
  [homeLink, heroHomeLink].forEach(el => {
    if (el) {
      el.addEventListener('click', e => {
        // let default anchor behavior happen; it points to './'
        // we could also reset location explicitly if using JS
      });
    }
  });
  if (infoClose && infoCard) {
    infoClose.addEventListener('click', () => {
      infoCard.classList.remove('show-card');
    });
  }

  // validação de site via botão na nav
  const validateBtn = document.getElementById('validate-site-btn');
  const validateSection = document.getElementById('validate-section');
  const homeLink = document.getElementById('home-link');
  const heroHomeLink = document.getElementById('hero-home-link');
  const submitUrl = document.getElementById('submit-url');
  const siteUrlInput = document.getElementById('site-url');
  const resultArea = document.getElementById('result-area');
  let lastUrl = '';

  const feedbackSection = document.getElementById('feedback-section');
  const feedbackResult = document.getElementById('feedback-result');
  const ratingSection = document.getElementById('rating-section');
  const ratingSubmit = document.getElementById('rating-submit');
  let ratingValue = 5; // default
  // star elements
  const stars = ratingSection ? ratingSection.querySelectorAll('.star-rating span') : [];
  // link generator elements (declared early so event listener below can reference them)
  const generateLinkBtn = document.getElementById('generate-link-btn');
  const linkSection = document.getElementById('link-section');
  // buttons in lead cards that should redirect with prefilled parameters
  const validateGlossaryBtn = document.getElementById('validate-glossary');
  const validateBemvindoBtn = document.getElementById('validate-bemvindo');
  const linkUrlInput = document.getElementById('link-url');
  const linkNameInput = document.getElementById('link-name');
  const creatorNameInput = document.getElementById('creator-name');
  const creatorEmailInput = document.getElementById('creator-email');
  const linkTopicInput = document.getElementById('link-topic');
  // option buttons groups
  const issuesYes = document.querySelector('#opt-issues .opt-btn.yes');
  const issuesNo = document.querySelector('#opt-issues .opt-btn.no');
  const featureYes = document.querySelector('#opt-feature .opt-btn.yes');
  const featureNo = document.querySelector('#opt-feature .opt-btn.no');
  const taskYes = document.querySelector('#opt-task .opt-btn.yes');
  const taskNo = document.querySelector('#opt-task .opt-btn.no');
  const dsYes = document.querySelector('#opt-ds .opt-btn.yes');
  const dsNo = document.querySelector('#opt-ds .opt-btn.no');
  const linkIssuesDesc = document.getElementById('link-issues-desc');
  const linkFeatureDesc = document.getElementById('link-feature-desc');
  const linkTaskDesc = document.getElementById('link-task-desc');
  const linkDsDesc = document.getElementById('link-ds-desc');
  const linkTimestamp = document.getElementById('link-timestamp');
  const generateLinkSubmit = document.getElementById('generate-link-submit');
  // storage array for generated links
  const generatedLinks = [];
  const welcomeSection = document.getElementById('welcome-section');
  const welcomeDetails = document.getElementById('welcome-details');
  const linkInfo = document.getElementById('link-info');

  // configure redirection for static lead cards
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  if (validateGlossaryBtn) {
    validateGlossaryBtn.addEventListener('click', () => {
      const params = '?site=https%3A%2F%2Fnevext.github.io%2Fglossario-ingles-ciesa%2F&siteName=Glossary&creator=nevext&email=nevext%40outlook.com&topic=Demo&ts=2026-02-22T08%3A18%3A52.847Z&issues=1&feature=0&task=1&ds=0';
      window.open(baseUrl + params, '_blank');
    });
  }
  if (validateBemvindoBtn) {
    validateBemvindoBtn.addEventListener('click', () => {
      const params = '?site=https%3A%2F%2Fnevext.github.io%2Fsite-boas-vindas-ciesa%2F&siteName=Bem+vindo+ao+CIESA&creator=nevext&email=nevext%40outlook.com&topic=Demo&ts=2026-02-22T08%3A20%3A02.210Z&issues=0&feature=1&task=0&ds=0';
      window.open(baseUrl + params, '_blank');
    });
  }

  // se houver parâmetros na URL, pré-preenche e abre a validação
  (function(){
    const qs = new URLSearchParams(window.location.search);
    const site = qs.get('site');
    if (site && validateSection) {
      // collect link info
      const info = {
        site,
        siteName: qs.get('siteName') || '',
        creator: qs.get('creator') || '',
        email: qs.get('email') || '',
        topic: qs.get('topic') || '',
        issues: qs.has('issues') ? (qs.get('issues')==='1' ? 1 : 0) : null,
        issuesDesc: '',
        feature: qs.has('feature') ? (qs.get('feature')==='1' ? 1 : 0) : null,
        featureDesc: '',
        task: qs.has('task') ? (qs.get('task')==='1' ? 1 : 0) : null,
        taskDesc: '',
        ds: qs.has('ds') ? (qs.get('ds')==='1' ? 1 : 0) : null,
        dsDesc: ''
      };
      // save for later prefill
      window.linkPrefill = info;
      // show welcome card
      if (welcomeSection && welcomeDetails) {
        welcomeSection.classList.add('show-card');
        const innerCard = welcomeSection.querySelector('.info-card');
        if (innerCard) innerCard.classList.add('show-card');
        const maskedEmail = maskEmail(info.email);
        const maskedCreator = maskName(info.creator);
        let html = `<p>Projeto: ${info.siteName || info.site}</p>`;
        html += `<p>Enviado por: ${maskedCreator} (${maskedEmail})</p>`;
        if (info.topic) html += `<p>Tópico: ${info.topic}</p>`;
        if (info.issues===1) html += `<p>Issues incluído</p>`;
        else if (info.issues===0) html += `<p>Não quer foco em issues.</p>`;
        if (info.feature===1) html += `<p>Feature incluído</p>`;
        else if (info.feature===0) html += `<p>Não quer foco em feature request.</p>`;
        if (info.task===1) html += `<p>Task incluído</p>`;
        else if (info.task===0) html += `<p>Não quer foco em task.</p>`;
        if (info.ds===1) html += `<p>DS incluído</p>`;
        else if (info.ds===0) html += `<p>Não quer foco em DS.</p>`;
        welcomeDetails.innerHTML = html;
        setTimeout(() => {
          welcomeSection.classList.remove('show-card');
          const inner = welcomeSection.querySelector('.info-card');
          if (inner) inner.classList.remove('show-card');
          // after welcome, open validate and show only preview/status for 7s
          validateSection.classList.add('show-card');
          shiftHeaderUp(); // ensure header hides to avoid card being pushed up
          const validateCard = document.getElementById('validate-card');
          const linkFlow = document.getElementById('validate-link-flow');
          const normalFlow = document.getElementById('validate-normal-flow');
          if (linkFlow && normalFlow && validateCard) {
            linkFlow.style.display = 'flex';
            normalFlow.style.display = 'none';
            // preencher status/prévia
            document.getElementById('validate-status').innerHTML = '<b>Status:</b> Dependendo da privacidade do site o layout prévio pode não retornar';
            // preview
            document.getElementById('validate-preview').innerHTML = `<iframe src="${site}" style="width:90%;height:300px;border:1px solid #ccc;background:#fff;border-radius:8px;" sandbox="allow-scripts allow-same-origin"></iframe>`;
          }
          setTimeout(() => {
            // após 7s, pular fluxo de validação e abrir diretamente feedback
            if (linkFlow && normalFlow && validateCard) {
              linkFlow.style.display = 'none';
              normalFlow.style.display = 'none';
              // esconder a etapa de validação
              validateSection.classList.remove('show-card');
              openFeedbackForLink(site);
            }
            // populate link-info for preview
            if (linkInfo) {
              linkInfo.innerHTML = html;
            }
            // disable/mark textareas based on info flags
            function lockField(id, flag){
              const ta = document.getElementById(id);
              if (ta){
                if (flag===0){
                  ta.disabled = true;
                  ta.style.background = 'rgb(248, 0, 0)';
                  ta.placeholder = "";
                } else {
                  ta.disabled = false;
                  ta.style.background = '';
                  ta.placeholder = '';
                }
              }
            }
            lockField('feedback-issues', info.issues);
            lockField('feedback-feature', info.feature);
            lockField('feedback-task', info.task);
            lockField('feedback-ds', info.ds);
          }, 7000);
        });
      }
    }
  })();

  const headerEl = document.querySelector('.site-header');
  function shiftHeaderUp(){ 
    if (headerEl) headerEl.classList.add('shift-up');
    // mark any open validate/link section for offset
    [validateSection, linkSection].forEach(sec => {
      if (sec) sec.classList.add('header-visible');
    });
  }
  function shiftHeaderDown(){ 
    if (headerEl) headerEl.classList.remove('shift-up');
    [validateSection, linkSection].forEach(sec => {
      if (sec) sec.classList.remove('header-visible');
    });
  }
  if (validateBtn && validateSection) {
      validateBtn.addEventListener('click', () => {
        shiftHeaderUp();
        validateSection.classList.add('show-card');
        validateBtn.blur();
      });
      // clicar fora do card fecha e reinicia formulário
      validateSection.addEventListener('click', e => {
        if (e.target === validateSection) {
          validateSection.classList.remove('show-card');
          resetValidation();
          shiftHeaderDown();
        }
      });
  }  
  // also hide header when opening link generator
  if (generateLinkBtn && linkSection) {
      generateLinkBtn.addEventListener('click', () => {
        shiftHeaderUp();
        linkSection.classList.add('show-card');
        generateLinkBtn.blur();
        // start real time clock
        if (linkTimestamp) {
          // simple real-time clock without blinking
          linkClockInterval = setInterval(() => {
            linkTimestamp.textContent = `Data/hora: ${new Date().toLocaleString()}`;
          }, 1000);
        }
      });
      linkSection.addEventListener('click', e => {
        if (e.target === linkSection) {
          linkSection.classList.remove('show-card');
          clearInterval(linkClockInterval);
          shiftHeaderDown();
          // clear fields
          linkUrlInput && (linkUrlInput.value='');
          linkNameInput && (linkNameInput.value='');
          creatorNameInput && (creatorNameInput.value='');
          creatorEmailInput && (creatorEmailInput.value='');
          linkTopicInput && (linkTopicInput.value='');
          [cbIssues, cbFeature, cbTask, cbDs].forEach(ch => ch && (ch.checked=false));
          [linkIssuesDesc, linkFeatureDesc, linkTaskDesc, linkDsDesc].forEach(ta => ta && (ta.style.display='none'));
        }
      });
  }
  // open link generator modal
  let linkClockInterval;
  // show/hide description textareas
  function setupOptionButtons(yesBtn, noBtn) {
    if (!yesBtn || !noBtn) return;
    yesBtn.addEventListener('click', () => {
      yesBtn.classList.add('selected');
      noBtn.classList.remove('selected');
    });
    noBtn.addEventListener('click', () => {
      noBtn.classList.add('selected');
      yesBtn.classList.remove('selected');
    });
  }
  setupOptionButtons(issuesYes, issuesNo);
  setupOptionButtons(featureYes, featureNo);
  setupOptionButtons(taskYes, taskNo);
  setupOptionButtons(dsYes, dsNo);

  if (generateLinkBtn && linkSection) {
    generateLinkBtn.addEventListener('click', () => {
      linkSection.classList.add('show-card');
      generateLinkBtn.blur();
      // start real time clock
      if (linkTimestamp) {
        linkClockInterval = setInterval(() => {
          // fade effect
          linkTimestamp.classList.add('fade-out');
          setTimeout(() => {
            linkTimestamp.textContent = `Data/hora: ${new Date().toLocaleString()}`;
            linkTimestamp.classList.remove('fade-out');
          }, 300);
        }, 1000);
      }
    });
    linkSection.addEventListener('click', e => {
      if (e.target === linkSection) {
        linkSection.classList.remove('show-card');
        clearInterval(linkClockInterval);
        // clear fields
        linkUrlInput && (linkUrlInput.value='');
        linkNameInput && (linkNameInput.value='');
        creatorNameInput && (creatorNameInput.value='');
        creatorEmailInput && (creatorEmailInput.value='');
        linkTopicInput && (linkTopicInput.value='');
        [cbIssues, cbFeature, cbTask, cbDs].forEach(ch => ch && (ch.checked=false));
        [linkIssuesDesc, linkFeatureDesc, linkTaskDesc, linkDsDesc].forEach(ta => ta && (ta.style.display='none'));
      }
    });
  }

  // copy link button
  const linkResult = document.getElementById('link-result');
  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const generatedInput = document.getElementById('generated-link');
      if (generatedInput) {
        generatedInput.select();
        document.execCommand('copy');
        showNotification('Link copiado para a área de transferência', 3000);
      }
    });
  }
  // allow closing link-result by clicking outside
  if (linkResult) {
    linkResult.addEventListener('click', e => {
      if (e.target === linkResult) {
        linkResult.classList.remove('show-card');
      }
    });
  }

  // também permitir fechar feedback-section clicando fora
  if (feedbackSection) {
      feedbackSection.addEventListener('click', e => {
        if (e.target === feedbackSection) {
          feedbackSection.classList.remove('show-card');
          resetValidation();
        }
      });
  }

  // fechar feedback-result clicando fora
  if (feedbackResult) {
      feedbackResult.addEventListener('click', e => {
        if (e.target === feedbackResult) {
          feedbackResult.classList.remove('show-card');
          const inner = feedbackResult.querySelector('.info-card');
          if (inner) inner.classList.remove('show-card');
          // depois de fechar o resultado, limpamos tudo
          feedbackSection && feedbackSection.classList.remove('show-card');
          validateSection && validateSection.classList.remove('show-card');
          resetValidation();
        }
      });
  }

  // fechar rating-section clicando fora
  if (ratingSection) {
      ratingSection.addEventListener('click', e => {
        if (e.target === ratingSection) {
          ratingSection.classList.remove('show-card');
          feedbackSection && feedbackSection.classList.remove('show-card');
          validateSection && validateSection.classList.remove('show-card');
          resetValidation();
          sendFeedback.disabled = false;
          sendFeedback.textContent = sendFeedbackOldText || 'Validar';
        }
      });
  }

  if (submitUrl && siteUrlInput && resultArea) {
    const confirmArea = document.getElementById('confirm-area');
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');
    // lastUrl moved to outer scope above

    submitUrl.addEventListener('click', () => {
      const url = siteUrlInput.value.trim();
      if (!url) return;
      lastUrl = url;
      resultArea.innerHTML = '<p>Carregando...</p>';
      confirmArea.style.display = 'none';
      // tenta buscar cabeçalho para obter status, mas em qualquer caso monta iframe
      fetch(url, {method:'HEAD'})
        .then(resp => {
          const status = resp.status;
          // se for 200, substitui o texto conforme solicitado
          const displayStatus = status === 200
            ? 'Dependendo da privacidade do site o layout prévio pode  não retornar'
            : status;
          resultArea.innerHTML = `<div class="nested-card"><strong>Status:</strong> ${displayStatus}</div><iframe src="${url}"></iframe>`;
          confirmArea.style.display = 'block';
        })
        .catch(err => {
          resultArea.innerHTML = `<p>Erro ao buscar cabeçalho: ${err.message}</p><iframe src="${url}"></iframe>`;
          confirmArea.style.display = 'block';
        });
    });

    if (yesBtn) {
      yesBtn.addEventListener('click', () => {
        // abrir feedback section
        const feedbackSection = document.getElementById('feedback-section');
        const feedbackPreview = document.getElementById('feedback-preview');
        if (feedbackSection && feedbackPreview) {
          feedbackPreview.innerHTML = `<p>${lastUrl}</p><iframe src="${lastUrl}"></iframe>`;
          // also add clickable link below iframe
          const previewLink = document.getElementById('preview-link');
          if (previewLink) {
            previewLink.href = lastUrl;
            previewLink.textContent = lastUrl;
          }
          feedbackSection.classList.add('show-card');
        }
      });
    }

    if (noBtn) {
      noBtn.addEventListener('click', () => {
        confirmArea.style.display = 'none';
        showNotification(
          'Você precisa inserir o link correto. URLs devem começar com http:// ou https:// e apontar para um site acessível. <a href="https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web#url" target="_blank" rel="noopener">Ver mais</a>',
          10000
        );
      });
    }
  }


  // helpers
  function maskEmail(email){
    if (!email) return '';
    const at = email.indexOf('@');
    if (at<=1) return '*'.repeat(at)+email.slice(at);
    return email[0] + '***' + email.slice(at-1);
  }
  function maskName(name){
    if (!name) return '';
    return name.split(' ').map(n=>n[0]+'.').join(' ');
  }

  // abre diretamente a seção de feedback para um link fornecido (sem passar por confirmação)
  function openFeedbackForLink(site){
    lastUrl = site;
    // prefill title and responsible email if provided
    const pre = window.linkPrefill || {};
    if (pre.topic) {
      const titleEl = document.getElementById('test-title');
      if (titleEl) {
        titleEl.value = pre.topic;
        titleEl.readOnly = true;
      }
    }
    if (pre.email) {
      const respEl = document.getElementById('responsible-email');
      if (respEl) {
        respEl.value = pre.email;
        respEl.readOnly = true;
      }
    }
    const feedbackPreview = document.getElementById('feedback-preview');
    if (feedbackPreview) {
      feedbackPreview.innerHTML = `<p>${site}</p><iframe src="${site}"></iframe>`;
      const previewLink = document.getElementById('preview-link');
      if (previewLink) {
        previewLink.href = site;
        previewLink.textContent = site;
      }
    }
    if (feedbackSection) {
      feedbackSection.classList.add('show-card');
    }
  }

  // combined help message for all fields
  function setupHelpAll(){
    const btn = document.getElementById('help-all');
    const helpSec = document.getElementById('help-section');
    const helpClose = document.getElementById('help-close');
    const validateSec = document.getElementById('validate-section');
    if (!btn || !helpSec) return;
    btn.addEventListener('click', () => {
      document.body.appendChild(helpSec);
      if (validateSec) validateSec.classList.remove('show-card');
      helpSec.classList.add('show-card');
    });
    if (helpClose) {
      helpClose.addEventListener('click', () => {
        helpSec.classList.remove('show-card');
        if (validateSec) validateSec.classList.add('show-card');
      });
    }
  }
  setupHelpAll();

  // week validate feature card
  // Ajude-me instruções formalizadas
  (function(){
    const ajudeLink = document.querySelector('.link-group a[href="#"]:nth-child(3)');
    const ajudeCard = document.getElementById('ajude-card');
    const ajudeInfoCard = document.getElementById('ajude-info-card');
    const ajudeValidateBtn = document.getElementById('ajude-validate-btn');
    const ajudeLinkBtn = document.getElementById('ajude-link-btn');
    const ajudeClose = document.getElementById('ajude-close');
    const ajudeValidateSection = document.getElementById('ajude-validate-section');
    const ajudeLinkSection = document.getElementById('ajude-link-section');
    if (ajudeLink && ajudeCard) {
      ajudeLink.addEventListener('click', e => {
        e.preventDefault();
        document.body.appendChild(ajudeCard);
        shiftHeaderUp();
        ajudeCard.classList.add('show-card');
        if (ajudeInfoCard) ajudeInfoCard.classList.add('show-card');
        // sempre começa na seção de validação
        ajudeValidateSection.style.display = '';
        ajudeLinkSection.style.display = 'none';
      });
    }
    if (ajudeValidateBtn && ajudeLinkBtn) {
      ajudeValidateBtn.addEventListener('click', () => {
        ajudeValidateSection.style.display = '';
        ajudeLinkSection.style.display = 'none';
      });
      ajudeLinkBtn.addEventListener('click', () => {
        ajudeValidateSection.style.display = 'none';
        ajudeLinkSection.style.display = '';
      });
    }
    if (ajudeClose) {
      ajudeClose.addEventListener('click', () => {
        ajudeCard.classList.remove('show-card');
        if (ajudeInfoCard) ajudeInfoCard.classList.remove('show-card');
        shiftHeaderDown();
      });
    }
  })();
  // Footer terms-of-use modal
  (function(){
    const footerTerms = document.getElementById('footer-terms-link');
    const termsSection = document.getElementById('terms-section');
    const termsClose = document.getElementById('terms-close');
    const termsCard = document.getElementById('terms-info-card');
    if (footerTerms && termsSection) {
      footerTerms.addEventListener('click', e => {
        e.preventDefault();
        document.body.appendChild(termsSection);
        shiftHeaderUp();
        termsSection.classList.add('show-card');
        if (termsCard) termsCard.classList.add('show-card');
      });
    }
    if (termsClose) {
      termsClose.addEventListener('click', () => {
        termsSection.classList.remove('show-card');
        if (termsCard) termsCard.classList.remove('show-card');
        shiftHeaderDown();
      });
    }
  })();
  (function(){
    const weekLink = document.getElementById('week-link');
    const weekCard = document.getElementById('week-card');
    const weekClose = document.getElementById('week-close');
    if (weekLink && weekCard) {
      const weekInfoCard = weekCard.querySelector('.info-card');
      weekLink.addEventListener('click', e => {
        e.preventDefault();
        document.body.appendChild(weekCard);
        shiftHeaderUp();
        weekCard.classList.add('show-card');
        if (weekInfoCard) weekInfoCard.classList.add('show-card');
      });
    }
    if (weekClose) {
      weekClose.addEventListener('click', () => {
        weekCard.classList.remove('show-card');
        const weekInfoCard = weekCard.querySelector('.info-card');
        if (weekInfoCard) weekInfoCard.classList.remove('show-card');
        shiftHeaderDown();
      });
    }
  })();

  function resetValidation(){
    siteUrlInput.value = '';
    resultArea.innerHTML = '';
    lastUrl = '';
    const confirmAreaEl = document.getElementById('confirm-area');
    if (confirmAreaEl) confirmAreaEl.style.display = 'none';
    // limpar campos de feedback que possam ter sido travados
    const titleEl = document.getElementById('test-title');
    if (titleEl) { titleEl.value=''; titleEl.readOnly=false; }
    const respEl = document.getElementById('responsible-email');
    if (respEl) { respEl.value=''; respEl.readOnly=false; }
    const statusEl = document.getElementById('test-status');
    if (statusEl) statusEl.value = '';
    // caso o input estivesse desabilitado ou button desabilitado no futuro
    if (submitUrl) submitUrl.disabled = false;
  }

  // track notifications so newest appear above previous
  let notifCount = 0;
  function showNotification(html, duration = 10000){
    notifCount++;
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.style.zIndex = 2000 + notifCount;
    // offset older messages upward
    notif.style.bottom = `${20 + (notifCount-1)*60}px`;
    notif.innerHTML = `<span class="close-notif">&times;</span>${html}`;
    document.body.appendChild(notif);
    const remove = () => {
      if (notif.parentNode) notif.parentNode.removeChild(notif);
    };
    const closeBtn = notif.querySelector('.close-notif');
    closeBtn.addEventListener('click', remove);
    setTimeout(() => {
      remove();
      notifCount = Math.max(0, notifCount-1);
    }, duration);
  }

  // enviar email com dados de feedback
  let savedEmail = '';
  
  // handle generate link submit
  if (generateLinkSubmit) {
    generateLinkSubmit.addEventListener('click', () => {
      const now = new Date();
      const url = linkUrlInput ? linkUrlInput.value.trim() : '';
      const record = {
        url,
        siteName: linkNameInput ? linkNameInput.value.trim() : '',
        creatorName: creatorNameInput ? creatorNameInput.value.trim() : '',
        creatorEmail: creatorEmailInput ? creatorEmailInput.value.trim() : '',
        topic: linkTopicInput ? linkTopicInput.value.trim() : '',
        issues: issuesYes && issuesYes.classList.contains('selected') ? 1 : (issuesNo && issuesNo.classList.contains('selected') ? 0 : null),
        issuesDesc: '',
        feature: featureYes && featureYes.classList.contains('selected') ? 1 : (featureNo && featureNo.classList.contains('selected') ? 0 : null),
        featureDesc: '',
        task: taskYes && taskYes.classList.contains('selected') ? 1 : (taskNo && taskNo.classList.contains('selected') ? 0 : null),
        taskDesc: '',
        ds: dsYes && dsYes.classList.contains('selected') ? 1 : (dsNo && dsNo.classList.contains('selected') ? 0 : null),
        dsDesc: '',
        timestamp: now.toISOString()
      };
      // antes de finalizar a geração, confirmar termos de uso
      const termsMsg2 = "Ao gerar um link você será considerado responsável pelo envio do mesmo e deverá confiar no dono do site. Verifique o card 'Termos de Uso' abaixo do segundo card de apresentação.";
      if (!confirm(termsMsg2)) return;
      generatedLinks.push(record);
      // generate shareable link with query params
      const params = new URLSearchParams({
        site: url,
        siteName: record.siteName,
        creator: record.creatorName,
        email: record.creatorEmail,
        topic: record.topic,
        ts: record.timestamp
      });
      if (record.issues !== null) params.set('issues', record.issues.toString());
      if (record.feature !== null) params.set('feature', record.feature.toString());
      if (record.task !== null) params.set('task', record.task.toString());
      if (record.ds !== null) params.set('ds', record.ds.toString());
      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      console.log('Generated link record', record);
      console.log('Shareable URL:', shareUrl);
      // display link-result card
      const generatedInput = document.getElementById('generated-link');
      const summaryDiv = document.getElementById('link-summary');
      if (generatedInput) {
        generatedInput.value = shareUrl;
      }
      // fill summary
      if (summaryDiv) {
        let sum = `<p>Site: ${record.siteName || record.url}</p>`;
        sum += `<p>Criador: ${maskName(record.creator)} (${maskEmail(record.creatorEmail)})</p>`;
        if (record.topic) sum += `<p>Tópico: ${record.topic}</p>`;
        if (record.issues===1) sum += `<p>Issues incluído</p>`;
        else if (record.issues===0) sum += `<p>Sem foco em issues</p>`;
        if (record.feature===1) sum += `<p>Feature incluído</p>`;
        else if (record.feature===0) sum += `<p>Sem foco em feature</p>`;
        if (record.task===1) sum += `<p>Task incluído</p>`;
        else if (record.task===0) sum += `<p>Sem foco em task</p>`;
        if (record.ds===1) sum += `<p>DS incluído</p>`;
        else if (record.ds===0) sum += `<p>Sem foco em DS</p>`;
        summaryDiv.innerHTML = sum;
      }
      linkSection.classList.remove('show-card');
      if (linkResult) {
        linkResult.classList.add('show-card');
      }
      clearInterval(linkClockInterval);
      linkUrlInput && (linkUrlInput.value='');
      linkNameInput && (linkNameInput.value='');
      creatorNameInput && (creatorNameInput.value='');
      creatorEmailInput && (creatorEmailInput.value='');
    });
  }
  let sendFeedbackOldText = '';

  // star rating interaction
  if (stars && stars.length) {
    stars.forEach(span => {
      span.addEventListener('mouseover', () => {
        const val = +span.getAttribute('data-value');
        highlightStars(val);
      });
      span.addEventListener('mouseout', () => {
        highlightStars(ratingValue);
      });
      span.addEventListener('click', () => {
        ratingValue = +span.getAttribute('data-value');
        highlightStars(ratingValue);
      });
    });
    function highlightStars(val) {
      stars.forEach(s => {
        const v = +s.getAttribute('data-value');
        if (v <= val) s.classList.add('selected');
        else s.classList.remove('selected');
      });
    }
    // initial highlight
    highlightStars(ratingValue);
  }

  // rating submit handler using ratingValue
  if (ratingSubmit && ratingSection) {
    ratingSubmit.addEventListener('click', () => {
      const starsCount = ratingValue;
      if (starsCount && starsCount < 5) {
        const sub3 = encodeURIComponent('Feedback de experiência');
        const body3 = encodeURIComponent(
          `Usuário deu ${starsCount} estrelas à experiência.`
        );
        window.location.href = `mailto:nevext@outlook.com?subject=${sub3}&body=${body3}`;
      }
      // fechar tudo e resetar
      ratingSection.classList.remove('show-card');
      feedbackSection && feedbackSection.classList.remove('show-card');
      validateSection && validateSection.classList.remove('show-card');
      resetValidation();
      sendFeedback.disabled = false;
      sendFeedback.textContent = sendFeedbackOldText || 'Validar';
      // blur validate button so user can click again
      validateBtn && validateBtn.blur();
    });
  }
  const sendFeedback = document.getElementById('send-feedback');
  if (sendFeedback) {
    sendFeedback.addEventListener('click', () => {
      const title = document.getElementById('test-title').value.trim();
      const emailField = document.getElementById('responsible-email');
      const email = emailField.value.trim();
      const desc = document.getElementById('test-desc').value.trim();
      const status = document.getElementById('test-status').value;
      const previewUrl = lastUrl;
      if (!email) return alert('Preencha o email do responsável');

      // salvar para reutilização
      savedEmail = email;

      // antes de prosseguir, lembre o usuário dos termos de uso
      const termsMsg = "Ao enviar sua validação você será redirecionado para o email informado e deve confirmar que confia no proprietário do site. Leia o card 'Termos de Uso' abaixo do segundo card de apresentação antes de continuar.";
      if (!confirm(termsMsg)) return;
      // guardar texto original para restaurar depois
      sendFeedbackOldText = sendFeedback.textContent;
      // efeito de carregamento
      sendFeedback.disabled = true;
      const oldText = sendFeedback.textContent;
      sendFeedback.textContent = 'Enviando...';

      setTimeout(() => {
        const subject = encodeURIComponent(`Validação de site: ${title}`);
        // collect additional textareas
        const issuesText = document.getElementById('feedback-issues').value.trim();
        const featureText = document.getElementById('feedback-feature').value.trim();
        const taskText = document.getElementById('feedback-task').value.trim();
        const dsText = document.getElementById('feedback-ds').value.trim();
        let bodyText = `URL: ${previewUrl}\nStatus: ${status}\n\nDescrição:\n${desc}`;
        if (issuesText) bodyText += `\n\nIssues:\n${issuesText}`;
        if (featureText) bodyText += `\n\nFeature request:\n${featureText}`;
        if (taskText) bodyText += `\n\nTask:\n${taskText}`;
        if (dsText) bodyText += `\n\nDS:\n${dsText}`;
        const body = encodeURIComponent(bodyText);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

        // após disparo, mostrar card de resultado com pergunta
        if (feedbackResult) {
          // esconder formulário abaixo para que o novo card fique em destaque
          feedbackSection && feedbackSection.classList.remove('show-card');
          feedbackResult.classList.add('show-card');
          // também animar o inner card
          const inner = feedbackResult.querySelector('.info-card');
          if (inner) inner.classList.add('show-card');
          const yesBtn = document.getElementById('feedback-result-yes');
          const noBtn = document.getElementById('feedback-result-no');
          const handleClose = (success) => {
            // se falhou, reenvia para nevext
            if (!success) {
              const sub2 = encodeURIComponent('Problema na validação');
              const body2 = encodeURIComponent(
                `O usuário tentou enviar para ${email} mas houve problema.`
              );
              window.location.href = `mailto:nevext@outlook.com?subject=${sub2}&body=${body2}`;
            }
            // fechar feedback-result e mostrar rating card
            feedbackResult.classList.remove('show-card');
            if (ratingSection) {
              ratingSection.classList.add('show-card');
            } else {
              // fallback prompt if elemento não existir
              const stars = prompt(
                'Avalie sua experiência de validação (1 a 5 estrelas):',
                '5'
              );
              if (stars !== null && +stars < 5) {
                const sub3 = encodeURIComponent('Feedback de experiência');
                const body3 = encodeURIComponent(
                  `Usuário deu ${stars} estrelas à experiência.`
                );
                window.location.href = `mailto:nevext@outlook.com?subject=${sub3}&body=${body3}`;
              }
              // fechar tudo e resetar
              feedbackSection && feedbackSection.classList.remove('show-card');
              validateSection && validateSection.classList.remove('show-card');
              resetValidation();
              sendFeedback.disabled = false;
              sendFeedback.textContent = oldText;
            }
          };
          yesBtn && yesBtn.addEventListener('click', () => handleClose(true));
          noBtn && noBtn.addEventListener('click', () => handleClose(false));
        } else {
          // fallback: sem card, faça como antes
          const ok = confirm('A validação foi enviada corretamente para o email?');
          if (!ok) {
            const sub2 = encodeURIComponent('Problema na validação');
            const body2 = encodeURIComponent(
              `O usuário tentou enviar para ${email} mas houve problema.`
            );
            window.location.href = `mailto:nevext@outlook.com?subject=${sub2}&body=${body2}`;
          }
          const stars = prompt(
            'Avalie sua experiência de validação (1 a 5 estrelas):',
            '5'
          );
          if (stars !== null && +stars < 5) {
            const sub3 = encodeURIComponent('Feedback de experiência');
            const body3 = encodeURIComponent(
              `Usuário deu ${stars} estrelas à experiência.`
            );
            window.location.href = `mailto:nevext@outlook.com?subject=${sub3}&body=${body3}`;
          }
          sendFeedback.disabled = false;
          sendFeedback.textContent = oldText;
          resetValidation();
        }
      }, 1500);
    });
  }
});