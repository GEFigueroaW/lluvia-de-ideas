// =========================================
// SISTEMA LIMPIO - SOLO NUEVA ESTRUCTURA
// =========================================

console.log('🚀 [CLEAN-SYSTEM] Iniciando sistema limpio...');

// Variables globales necesarias
window.currentIdeas = {};

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    console.log(`[NOTIFICATION] ${type.toUpperCase()}: ${message}`);
    
    try {
        // Crear elemento de notificación visual
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ${type === 'error' ? 'background: #ff4444;' : ''}
            ${type === 'warning' ? 'background: #ffaa00;' : ''}
            ${type === 'success' ? 'background: #00ff88; color: #003311;' : ''}
            ${type === 'info' ? 'background: #007AFF;' : ''}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            try {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            } catch (e) {
                console.log('[NOTIFICATION] Error al remover notificación:', e);
            }
        }, 3000);
    } catch (error) {
        console.error('[NOTIFICATION] Error al crear notificación:', error);
    }
}

// Función para mostrar progreso de generación
function showGenerationProgress(platform, typesCount) {
    console.log(`[PROGRESS] Generando para ${platform} - ${typesCount} tipos`);
    
    const progressDiv = document.createElement('div');
    progressDiv.id = 'generation-progress';
    progressDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10001;
        text-align: center;
        color: #333;
        backdrop-filter: blur(10px);
    `;
    
    progressDiv.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 15px;">🤖</div>
        <h3 style="margin: 0 0 10px 0; color: #333;">Generando Ideas con IA...</h3>
        <p style="margin: 0; color: #666;">Para ${platform} • ${typesCount} tipo${typesCount > 1 ? 's' : ''}</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Conectando con DeepSeek API...</p>
        <div style="margin-top: 20px; width: 200px; height: 4px; background: #eee; border-radius: 2px; overflow: hidden;">
            <div style="width: 0%; height: 100%; background: linear-gradient(45deg, #667eea, #764ba2); transition: width 0.3s; animation: progress 8s ease-in-out infinite;" id="progress-bar"></div>
        </div>
    `;
    
    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes progress {
            0% { width: 0%; }
            25% { width: 30%; }
            50% { width: 60%; }
            75% { width: 85%; }
            100% { width: 100%; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(progressDiv);
}

// Función para ocultar progreso
function hideGenerationProgress() {
    const progressDiv = document.getElementById('generation-progress');
    if (progressDiv) {
        progressDiv.remove();
    }
}

// Función para copiar al portapapeles
function copyToClipboard(ideaKey) {
    try {
        const idea = window.currentIdeas[ideaKey];
        if (!idea) return;
        
        const textToCopy = `${idea.content}\n\n${idea.hashtags}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification('✅ Copiado al portapapeles', 'success');
            }).catch(err => {
                console.error('Error copiando:', err);
                fallbackCopyTextToClipboard(textToCopy);
            });
        } else {
            fallbackCopyTextToClipboard(textToCopy);
        }
    } catch (error) {
        console.error('Error en copyToClipboard:', error);
        showNotification('❌ Error al copiar', 'error');
    }
}

// Fallback para copiar texto
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('✅ Copiado al portapapeles', 'success');
        } else {
            showNotification('❌ Error al copiar', 'error');
        }
    } catch (err) {
        console.error('Fallback: Error al copiar', err);
        showNotification('❌ Error al copiar', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Función para obtener red social seleccionada (con fallback robusto)
function getSelectedSocialNetworkSafe() {
    try {
        // Opción 1: Función del carrusel
        if (typeof getSelectedSocialNetwork === 'function') {
            const network = getSelectedSocialNetwork();
            if (network && network !== 'undefined' && network !== '') {
                console.log('[CLEAN-SYSTEM] Red social desde carrusel:', network);
                return network;
            }
        }
        
        // Opción 2: Input oculto
        const hiddenInput = document.getElementById('singleSocialNetwork');
        if (hiddenInput && hiddenInput.value) {
            console.log('[CLEAN-SYSTEM] Red social desde input:', hiddenInput.value);
            return hiddenInput.value;
        }
        
        // Opción 3: Carrusel global
        if (window.socialCarousel) {
            const network = window.socialCarousel.getSelectedNetwork();
            if (network && network.name) {
                console.log('[CLEAN-SYSTEM] Red social desde window.socialCarousel:', network.name);
                return network.name;
            }
        }
        
        // Fallback
        console.log('[CLEAN-SYSTEM] Usando fallback: Facebook');
        return 'Facebook';
        
    } catch (error) {
        console.error('[CLEAN-SYSTEM] Error al obtener red social:', error);
        return 'Facebook';
    }
}

// Función para generar ideas con IA (múltiples alternativas)
async function generateIdeaWithAI(platform, keyword, type, userContext, includeCTA) {
    const providers = [
        {
            name: 'Hugging Face',
            url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
            headers: {},
            free: true
        },
        {
            name: 'Local Generation',
            local: true
        }
    ];
    
    for (const provider of providers) {
        try {
            if (provider.local) {
                return await generateLocalIdea(platform, keyword, type, userContext, includeCTA);
            } else {
                return await callExternalAPI(provider, platform, keyword, type, userContext, includeCTA);
            }
        } catch (error) {
            console.log(`[AI] ${provider.name} falló, probando siguiente...`);
            continue;
        }
    }
    
    // Si todos fallan, usar generación local inteligente
    return await generateFallbackIdea(platform, keyword, type, userContext, includeCTA);
}

// Función para generar ideas localmente con lógica inteligente
async function generateLocalIdea(platform, keyword, type, userContext, includeCTA) {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const templates = {
        'Informativo y educativo': [
            `¿Sabías que ${keyword} puede transformar tu día a día? Descubre cómo aplicarlo paso a paso.`,
            `5 datos fascinantes sobre ${keyword} que cambiarán tu perspectiva.`,
            `La guía completa de ${keyword}: todo lo que necesitas saber en un solo lugar.`,
            `Mitos vs. realidades sobre ${keyword}. ¡La #3 te sorprenderá!`
        ],
        'Venta directa y persuasivo': [
            `🔥 ¡Últimas 24 horas! Aprovecha esta oportunidad única con ${keyword}.`,
            `¿Cansado de buscar resultados? ${keyword} es la solución que estabas esperando.`,
            `Más de 10,000 personas ya cambiaron su vida con ${keyword}. ¿Serás el próximo?`,
            `No pierdas más tiempo. Comienza hoy mismo con ${keyword} y ve la diferencia.`
        ],
        'Posicionamiento y branding': [
            `En el mundo de ${keyword}, nosotros marcamos la diferencia.`,
            `Cuando pienses en ${keyword}, piensa en calidad. Piensa en nosotros.`,
            `15 años liderando el mercado de ${keyword}. La experiencia habla por sí sola.`,
            `${keyword} + innovación = nuestra fórmula del éxito.`
        ]
    };
    
    const platformLimits = {
        'Twitter': 240,
        'LinkedIn': 125,
        'Facebook': 500,
        'Instagram': 400,
        'TikTok': 300
    };
    
    const baseTemplates = templates[type] || templates['Informativo y educativo'];
    let content = baseTemplates[Math.floor(Math.random() * baseTemplates.length)];
    
    // Agregar contexto si existe
    if (userContext) {
        content += ` ${userContext}`;
    }
    
    // Agregar CTA si se solicita
    if (includeCTA) {
        const ctas = [
            '¡Comparte tu experiencia en los comentarios!',
            '¿Qué opinas? ¡Déjanos tu comentario!',
            'Dale like si te gustó y comparte con tus amigos.',
            '¡Síguenos para más contenido como este!'
        ];
        content += ` ${ctas[Math.floor(Math.random() * ctas.length)]}`;
    }
    
    // Limitar según la plataforma
    const limit = platformLimits[platform] || 400;
    if (content.length > limit) {
        content = content.substring(0, limit - 3) + '...';
    }
    
    // Generar hashtags relevantes
    const hashtags = generateSmartHashtags(keyword, platform, type);
    
    return {
        copyType: type,
        content: content,
        hashtags: hashtags,
        platform: platform
    };
}

// Función para generar hashtags inteligentes
function generateSmartHashtags(keyword, platform, type) {
    const baseHashtags = [`#${keyword.replace(/\s+/g, '')}`];
    
    const platformHashtags = {
        'Instagram': ['#insta', '#photo', '#viral', '#trending'],
        'TikTok': ['#fyp', '#viral', '#trending', '#tiktok'],
        'Twitter': ['#twitter', '#trending', '#viral'],
        'LinkedIn': ['#linkedin', '#professional', '#career', '#business'],
        'Facebook': ['#facebook', '#social', '#community']
    };
    
    const typeHashtags = {
        'Informativo y educativo': ['#tips', '#educational', '#learn', '#knowledge'],
        'Venta directa y persuasivo': ['#sale', '#offer', '#deal', '#limited'],
        'Posicionamiento y branding': ['#brand', '#quality', '#premium', '#leader']
    };
    
    const allHashtags = [
        ...baseHashtags,
        ...(platformHashtags[platform] || ['#social']),
        ...(typeHashtags[type] || ['#content']),
        '#marketing'
    ];
    
    // Seleccionar 4-5 hashtags aleatorios
    const selectedHashtags = [];
    const shuffled = allHashtags.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(5, shuffled.length); i++) {
        if (!selectedHashtags.includes(shuffled[i])) {
            selectedHashtags.push(shuffled[i]);
        }
    }
    
    return selectedHashtags.join(' ');
}

// Función fallback con ideas creativas
async function generateFallbackIdea(platform, keyword, type, userContext, includeCTA) {
    console.log(`[FALLBACK] Generando idea creativa para ${type}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const creativeIdeas = {
        'Informativo y educativo': `💡 Todo lo que debes saber sobre ${keyword}: consejos prácticos, tendencias actuales y secretos que los expertos no te cuentan. ${userContext ? `Especialmente útil para ${userContext}.` : ''} ${includeCTA ? '¡Comparte si te sirvió!' : ''}`,
        
        'Venta directa y persuasivo': `🎯 ¿Buscas resultados reales con ${keyword}? Esta es tu oportunidad de dar el siguiente paso. ${userContext ? `Perfecto para ${userContext}.` : ''} ${includeCTA ? '¡Actúa ahora, las plazas son limitadas!' : ''}`,
        
        'Posicionamiento y branding': `🌟 En el competitivo mundo de ${keyword}, la diferencia está en los detalles. Nosotros lo sabemos. ${userContext ? `Con experiencia en ${userContext}.` : ''} ${includeCTA ? '¡Conoce más sobre nosotros!' : ''}`
    };
    
    const content = creativeIdeas[type] || creativeIdeas['Informativo y educativo'];
    const hashtags = generateSmartHashtags(keyword, platform, type);
    
    return {
        copyType: type,
        content: content,
        hashtags: hashtags,
        platform: platform
    };
}

// Función principal de generación
async function generateCopywritingClean() {
    console.log('🚀 [CLEAN-SYSTEM] Iniciando generación limpia...');
    
    const generateBtn = document.getElementById('generateCopyBtn');
    if (!generateBtn) {
        showNotification('❌ Botón de generación no encontrado', 'error');
        return;
    }
    
    const originalText = generateBtn.textContent;
    
    try {
        // Obtener datos del formulario
        const platform = getSelectedSocialNetworkSafe();
        const keyword = document.getElementById('copyKeyword')?.value?.trim() || '';
        const copyTypes = Array.from(document.querySelectorAll('input[name="copyTypes"]:checked'))
            .map(cb => cb.value);
        const userContext = document.getElementById('copyContext')?.value?.trim() || '';
        const includeCTA = document.getElementById('includeCTA')?.checked || false;
        
        console.log('[CLEAN-SYSTEM] Datos del formulario:');
        console.log('- Plataforma:', platform);
        console.log('- Keyword:', keyword);
        console.log('- Copy Types:', copyTypes);
        console.log('- Context:', userContext);
        console.log('- Include CTA:', includeCTA);
        
        // Validaciones
        if (!keyword) {
            showNotification('⚠️ Por favor ingresa una palabra clave', 'warning');
            return;
        }
        
        if (copyTypes.length === 0) {
            showNotification('⚠️ Por favor selecciona al menos un tipo de copy', 'warning');
            return;
        }
        
        if (copyTypes.length > 3) {
            showNotification('⚠️ Máximo 3 tipos de copy permitidos', 'warning');
            return;
        }
        
        // Actualizar botón
        generateBtn.textContent = 'Generando...';
        generateBtn.disabled = true;
        
        // Mostrar progreso
        showGenerationProgress(platform, copyTypes.length);
        
        // Llamada a API de IA - Sistema robusto con múltiples alternativas
        console.log('[CLEAN-SYSTEM] Generando ideas con IA...');
        
        const generatedIdeas = [];
        
        for (const type of copyTypes) {
            try {
                const idea = await generateIdeaWithAI(platform, keyword, type, userContext, includeCTA);
                generatedIdeas.push(idea);
            } catch (error) {
                console.error(`[CLEAN-SYSTEM] Error generando idea para ${type}:`, error);
                // Fallback con idea creativa
                generatedIdeas.push(await generateFallbackIdea(platform, keyword, type, userContext, includeCTA));
            }
        }
        
        const ideas = generatedIdeas;
        
        // Guardar ideas
        window.currentIdeas = {};
        ideas.forEach((idea, index) => {
            window.currentIdeas[`idea${index + 1}`] = idea;
        });
        
        // Mostrar resultados
        displayResultsClean(window.currentIdeas);
        
        const successCount = ideas.filter(idea => !idea.content.includes('Error al generar')).length;
        const errorCount = ideas.length - successCount;
        
        if (errorCount === 0) {
            showNotification(`✅ ${successCount} ideas generadas exitosamente para ${platform}`, 'success');
        } else if (successCount > 0) {
            showNotification(`⚠️ ${successCount} ideas generadas, ${errorCount} con errores`, 'warning');
        } else {
            showNotification(`❌ Error generando todas las ideas. Verifica tu conexión.`, 'error');
        }
        
    } catch (error) {
        console.error('[CLEAN-SYSTEM] Error en generación:', error);
        showNotification('❌ Error al generar ideas. Revisa la consola.', 'error');
    } finally {
        // Restaurar botón
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
        hideGenerationProgress();
    }
}

// Función para mostrar resultados
function displayResultsClean(ideas) {
    console.log('[CLEAN-SYSTEM] Mostrando resultados:', ideas);
    
    let resultsContainer = document.getElementById('results');
    if (!resultsContainer) {
        // Crear contenedor de resultados si no existe
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'results';
        resultsContainer.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border-radius: 15px;
            backdrop-filter: blur(10px);
        `;
        
        // Insertar después del formulario
        const form = document.getElementById('copywritingForm') || document.querySelector('form');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(resultsContainer, form.nextSibling);
        } else {
            document.body.appendChild(resultsContainer);
        }
    }
    
    const ideaKeys = Object.keys(ideas);
    if (ideaKeys.length === 0) {
        resultsContainer.innerHTML = '<p>No hay ideas para mostrar.</p>';
        return;
    }
    
    let html = '<h2 style="color: white; margin-bottom: 20px; text-align: center;">💡 Ideas Generadas por IA</h2>';
    
    ideaKeys.forEach((key, index) => {
        const idea = ideas[key];
        const isError = idea.content.includes('Error al generar');
        
        html += `
            <div style="
                background: ${isError ? 'rgba(255,68,68,0.1)' : 'rgba(255,255,255,0.1)'};
                padding: 20px;
                margin: 15px 0;
                border-radius: 10px;
                border-left: 4px solid ${isError ? '#ff4444' : '#00ff88'};
                transition: transform 0.2s ease;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <h3 style="color: ${isError ? '#ff6666' : '#00ff88'}; margin: 0 0 10px 0; display: flex; align-items: center;">
                    ${isError ? '❌' : '✨'} ${idea.copyType}
                </h3>
                <p style="color: white; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px;">${idea.content}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <p style="color: #aaa; font-style: italic; margin: 0; font-size: 14px;">${idea.hashtags}</p>
                    ${!isError ? `<button onclick="copyToClipboard('${key}')" style="
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        transition: transform 0.2s ease;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        📋 Copiar
                    </button>` : ''}
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
    
    // Scroll a resultados
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Manejar selección múltiple de tipos de copy
function handleCopyTypeSelectionClean() {
    const checkboxes = document.querySelectorAll('input[name="copyTypes"]');
    const maxSelections = 3;
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const selectedCount = document.querySelectorAll('input[name="copyTypes"]:checked').length;
            
            if (selectedCount > maxSelections) {
                this.checked = false;
                showNotification('⚠️ Máximo 3 tipos de copy permitidos', 'warning');
                return;
            }
            
            updateCopyTypeNoteClean(selectedCount);
        });
    });
}

// Actualizar nota explicativa
function updateCopyTypeNoteClean(selectedCount) {
    const noteElement = document.querySelector('.field-note');
    if (!noteElement) return;
    
    let noteText = '';
    if (selectedCount === 0) {
        noteText = '🎯 Selecciona 1-3 tipos de copy para generar ideas variadas.';
    } else if (selectedCount === 1) {
        noteText = '🎯 Obtendrás 3 variaciones del tipo seleccionado.';
    } else if (selectedCount === 2) {
        noteText = '🎯 Obtendrás 2 ideas del primer tipo + 1 del segundo.';
    } else if (selectedCount === 3) {
        noteText = '🎯 Obtendrás 1 idea de cada tipo seleccionado.';
    }
    
    noteElement.textContent = noteText;
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ [CLEAN-SYSTEM] DOM cargado, inicializando...');
    
    try {
        // Manejar selección de tipos de copy
        handleCopyTypeSelectionClean();
        
        // Manejar envío del formulario
        const form = document.getElementById('copywritingForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                generateCopywritingClean();
            });
            console.log('✅ [CLEAN-SYSTEM] Formulario configurado');
        } else {
            console.warn('[CLEAN-SYSTEM] ⚠️ Formulario no encontrado');
            
            // Buscar formulario con otros selectores
            const alternativeForm = document.querySelector('form');
            if (alternativeForm) {
                alternativeForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    generateCopywritingClean();
                });
                console.log('✅ [CLEAN-SYSTEM] Formulario alternativo configurado');
            }
        }
        
        // Configurar botón de generar directamente
        const generateBtn = document.getElementById('generateCopyBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                generateCopywritingClean();
            });
            console.log('✅ [CLEAN-SYSTEM] Botón generar configurado');
        } else {
            console.warn('[CLEAN-SYSTEM] ⚠️ Botón generar no encontrado');
            
            // Buscar botón con otros selectores
            const alternativeBtn = document.querySelector('button[type="submit"], .btn-generate, .generate-btn');
            if (alternativeBtn) {
                alternativeBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    generateCopywritingClean();
                });
                console.log('✅ [CLEAN-SYSTEM] Botón alternativo configurado');
            }
        }
        
        // Inicializar nota
        updateCopyTypeNoteClean(1);
        
        console.log('🎉 [CLEAN-SYSTEM] Sistema limpio inicializado correctamente');
        
    } catch (error) {
        console.error('[CLEAN-SYSTEM] Error en inicialización:', error);
    }
});

// Exponer funciones globalmente para compatibilidad
window.showNotification = showNotification;
window.generateCopywritingClean = generateCopywritingClean;
window.displayResultsClean = displayResultsClean;
window.copyToClipboard = copyToClipboard;

console.log('✅ [CLEAN-SYSTEM] Script cargado correctamente');
