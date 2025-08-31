const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// Configuración de Deepseek API
const DEEPSEEK_API_KEY = 'sk-97c8f4c543fa45acabaf02ebcac60f03';
const DEEPSEEK_ENDPOINTS = [
    'https://api.deepseek.com/v1'
];

console.log('[INIT] Deepseek API configurado');

// FUNCIÓN PARA CONSTRUIR PROMPTS DINÁMICOS PARA DEEPSEEK
function buildPromptForPlatform(platform, keyword, userContext) {
    // Extraer el tipo de copy del userContext
    const copyType = userContext ? userContext.toLowerCase() : '';
    const isPositioning = copyType.includes('posicionamiento') || copyType.includes('branding');
    const isUrgency = copyType.includes('urgencia') || copyType.includes('escasez');
    const isDirectSale = copyType.includes('venta directa') || copyType.includes('persuasivo');
    
    let copyStrategy = '';
    if (isPositioning) {
        copyStrategy = 'POSICIONAMIENTO Y BRANDING - Enfócate en identidad, autenticidad, mindset, filosofía personal, transformación de identidad, construcción de marca personal';
    } else if (isUrgency) {
        copyStrategy = 'URGENCIA Y ESCASEZ - Enfócate en límites de tiempo, ofertas limitadas, oportunidades que expiran, FOMO, exclusividad, últimas oportunidades';
    } else if (isDirectSale) {
        copyStrategy = 'VENTA DIRECTA Y PERSUASIÓN - Enfócate en ROI, números específicos, resultados medibles, ofertas directas, precios, testimonios, garantías';
    } else {
        copyStrategy = 'GENERAL - Contenido engaging y persuasivo';
    }
    
    const platformSpecs = {
        'Facebook': {
            tone: 'conversacional y emocional',
            length: '150-200 palabras',
            style: 'storytelling personal, preguntas para engagement, emojis moderados',
            cta: 'comentarios y reacciones'
        },
        'LinkedIn': {
            tone: 'profesional pero humano',
            length: '200-300 palabras',
            style: 'insights profesionales, datos, experiencia laboral, hashtags relevantes',
            cta: 'networking y discusión profesional'
        },
        'X / Twitter': {
            tone: 'directo y impactante',
            length: '200-280 caracteres',
            style: 'statements contundentes, controversial, viral, threads cortos',
            cta: 'retweets y replies'
        },
        'Instagram': {
            tone: 'visual y aspiracional',
            length: '120-150 palabras',
            style: 'lifestyle, transformación visual, hashtags trending, muy emocional',
            cta: 'likes y shares en stories'
        },
        'WhatsApp': {
            tone: 'personal e íntimo',
            length: '80-120 palabras',
            style: 'mensaje directo, urgente, como de amigo cercano',
            cta: 'respuesta inmediata'
        },
        'TikTok': {
            tone: 'trendy y generacional',
            length: '80-100 palabras',
            style: 'viral, POV, trends actuales, muy casual',
            cta: 'duetos y comentarios'
        },
        'Telegram': {
            tone: 'analítico y exclusivo',
            length: '200-250 palabras',
            style: 'data-driven, análisis profundo, contenido premium',
            cta: 'forwarding y discusión'
        },
        'Reddit': {
            tone: 'auténtico y detallado',
            length: '300-400 palabras',
            style: 'experiencia real, storytime, muy genuino, sin marketing',
            cta: 'upvotes y comentarios'
        },
        'YouTube': {
            tone: 'educativo y entretenido',
            length: '200-300 palabras',
            style: 'descripción de video, promesa de valor, storytelling',
            cta: 'suscripciones y comentarios'
        }
    };
    
    const spec = platformSpecs[platform] || platformSpecs['Facebook'];
    
    return `Actúa como un experto copywriter especializado en ${platform}.

TEMA: "${keyword}"
ESTRATEGIA: ${copyStrategy}
PLATAFORMA: ${platform}

ESPECIFICACIONES TÉCNICAS:
- Tono: ${spec.tone}
- Longitud: ${spec.length}
- Estilo: ${spec.style}
- Call-to-Action: ${spec.cta}

INSTRUCCIONES CRÍTICAS:
1. Crea contenido ÚNICO y ORIGINAL sobre "${keyword}" (NO uses frases genéricas como "6 meses después" o "500+ casos")
2. Aplica la estrategia de ${copyStrategy.split(' - ')[0]} de manera auténtica
3. Adapta completamente al estilo de ${platform}
4. Incluye emojis relevantes pero no excesivos
5. Genera un gancho impactante en las primeras palabras
6. Asegúrate que sea copy-paste ready para publicar
7. VARÍA los números, timeframes y ejemplos - sé creativo y específico

FORMATO DE RESPUESTA:
Devuelve ÚNICAMENTE el copy final listo para publicar, sin explicaciones adicionales, sin comillas, sin "Aquí tienes" o introducciones.

El contenido debe ser completamente original y evitar cualquier patrón repetitivo.`;
}

// FUNCIÓN PARA GENERAR EJEMPLOS ESPECÍFICOS POR RED SOCIAL Y TIPO DE COPY (FALLBACK MEJORADO)
function getExamplesForNetwork(networkName, keyword, userContext) {
    // Extraer el tipo de copy del userContext
    const copyType = userContext ? userContext.toLowerCase() : '';
    const isPositioning = copyType.includes('posicionamiento') || copyType.includes('branding');
    const isUrgency = copyType.includes('urgencia') || copyType.includes('escasez');
    const isDirectSale = copyType.includes('venta directa') || copyType.includes('persuasivo');
    
    // Generar números y timeframes aleatorios para evitar repetición
    const timeframes = ['3 semanas', '45 días', '2 meses', '90 días', '4 meses', 'medio año', '8 meses', '1 año'];
    const numbers = ['127', '234', '89', '156', '67', '198', '341', '78', '245', '112'];
    const percentages = ['180%', '240%', '320%', '150%', '275%', '190%', '380%', '210%'];
    const cases = ['300+', '750+', '420+', '680+', '950+', '1200+', '380+', '560+'];
    
    const randomTime = timeframes[Math.floor(Math.random() * timeframes.length)];
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    const randomPercent = percentages[Math.floor(Math.random() * percentages.length)];
    const randomCases = cases[Math.floor(Math.random() * cases.length)];
    
    switch(networkName) {
        case 'Facebook':
            if (isPositioning) {
                return `💭 ${keyword} no cambió solo mis resultados... transformó completamente mi identidad. 🌟 Antes era alguien que "intentaba" cosas. Ahora soy alguien que las vive desde el alma. 💫 La diferencia no está en las técnicas, sino en quién me permito ser cuando las aplico. 🔮 Mi familia nota algo diferente en mí, pero no pueden poner en palabras qué es. ✨ Es esa confianza silenciosa que viene de estar alineado con tu verdadero propósito. 👇 ¿Alguna vez han sentido esa transformación de identidad tan profunda que hasta cambió su energía? 💕`;
            }
            if (isUrgency) {
                return `🚨 BREAKING: ${keyword} se retira del mercado en ${randomTime} ⏰ El creador anunció que cierra para siempre después de recibir ${randomCases} historias de transformación. 💥 "Ya cumplí mi propósito", dijo en su último video. 🔒 Después del deadline NO habrá excepciones, extensiones ni súplicas que funcionen. ⚡ Si lo has estado posponiendo, este es literalmente tu último chance. 👆 Comenta "ÚLTIMO" si necesitas el acceso antes de que desaparezca para siempre. ⏳`;
            }
            if (isDirectSale) {
                return `💰 NÚMEROS REALES: ${keyword} me generó $${randomNumber}K en ${randomTime} 📊 No es postureo, son screenshots verificables de mi cuenta bancaria. 🎯 La estrategia exacta que uso: ✅ ${randomTime} de implementación ✅ Cero inversión inicial ✅ Escalable a cualquier nivel 🔥 ¿Quieres el sistema paso a paso? 💸 Solo 50 personas este mes. Responde "${randomNumber}" si estás ready para cambiar tu situación financiera. 🚀`;
            }
            return `💭 Cuando probé ${keyword} por primera vez, honestly pensé que era otro trend pasajero. ${randomTime} después... mi vida es irreconocible. 🌟 No solo cambió mis resultados, cambió mi forma de pensar sobre las posibilidades.`;
            
        case 'LinkedIn':
            if (isPositioning) {
                return `🎯 LIDERAZGO TRANSFORMACIONAL: ${keyword} redefinió mi filosofía empresarial en ${randomTime}. 📈 No se trata de optimizar procesos... se trata de reimaginar qué significa liderar con propósito auténtico. 💡 Mi equipo pasó de ejecutar tareas a co-crear visiones. La transformación fue profunda: cambiamos de una mentalidad de "cumplir objetivos" a "impactar vidas". ⚡ El ROI más valioso no se mide en métricas, se siente en la energía del equipo cuando llegan cada lunes. 💼 ¿Cómo están redefiniendo ustedes el liderazgo desde la autenticidad? #LiderazgoAutentico #TransformacionOrganizacional #PropositoEmpresarial`;
            }
            if (isUrgency) {
                return `⚠️ ALERTA ESTRATÉGICA: La oportunidad de dominar ${keyword} se cierra Q1 2025. 📊 McKinsey confirma: solo las primeras ${randomCases} empresas que lo adopten mantendrán ventaja competitiva. ⏰ Timeline crítico: ${randomTime} para posicionarse antes de saturación total del mercado. 🎯 Early adopters ya capturan ${randomPercent} de las oportunidades emergentes. 💼 En mis 15 años como estratega, veo el mismo patrón: quienes actúan rápido dominan sectores completos. 🚀 ¿Su organización está preparada para liderar o seguir? #EstrategiaEmpresarial #VentajaCompetitiva #Innovacion`;
            }
            if (isDirectSale) {
                return `💎 ROI AUDITADO: ${keyword} incrementó nuestros ingresos ${randomPercent} en ${randomTime}. 📈 No son proyecciones, son resultados certificados por PwC. 🎯 Impacto específico documentado: ✅ +$${randomNumber}K en nuevos contratos ✅ ${randomPercent} mejora en retención de clientes ✅ ${randomCases} leads calificados adicionales 💼 Comparto la metodología exacta con 15 empresas serious este trimestre. 🤝 Investment: $4,997 (valor documentado: $47K). ¿Su organización califica? Reply "ROI" para detalles. 🚀 #ResultadosReales #CrecimientoEmpresarial #EstrategiaComercial`;
            }
            return `📊 INSIGHT PROFESIONAL: Después de analizar ${randomCases} implementaciones de ${keyword}, encontré un patrón que contradice las mejores prácticas tradicionales. 💡 Las organizaciones exitosas aumentaron productividad ${randomPercent} en ${randomTime}.`;
            
        case 'X / Twitter':
            if (isPositioning) {
                return `🧠 IDENTITY SHIFT: ${keyword} isn't something you DO, it's someone you BECOME. 💭 Stopped asking "How?" Started asking "Who?" 🔥 Everything changed in ${randomTime}. ⚡ Your results = Your identity. Change the identity, change everything. 🎯`;
            }
            if (isUrgency) {
                return `🚨 ${keyword} ENDS ${randomTime} 💥 Only ${randomNumber} spots left ⏰ Price jumps ${randomPercent} after deadline 🔥 Last time offering this 👆 Reply "${randomNumber}" if you want it`;
            }
            if (isDirectSale) {
                return `💰 ${keyword} = $${randomNumber}K in ${randomTime} 📊 Proof: pinned tweet 🎯 Exact system: ✅ ${randomTime} implementation ✅ $0 startup cost ✅ Infinitely scalable 🔥 Blueprint available 💸 RT + "${randomNumber}" for access`;
            }
            return `🔥 TRUTH: ${keyword} isn't what they told you. It's ${randomPercent} more powerful and 10x simpler. 💥 ${randomPercent} of people get this wrong...`;
            
        case 'WhatsApp':
            if (isPositioning) {
                return `🌟 ${keyword} transformó mi esencia en ${randomTime} 💎 No se trata de técnicas... se trata de convertirte en la versión más auténtica de ti mismo. ✨ Cuando alineas quién eres con lo que haces, la magia sucede sin esfuerzo. 🔮 Tu presencia se vuelve magnética naturalmente. 💫 ¿Ready para descubrir tu verdadero potencial? 🚀`;
            }
            if (isUrgency) {
                return `🚨 ÚLTIMO MOMENTO: Lo que descubrí sobre ${keyword} cambió mi vida en ${randomTime} 💥 Solo ${randomNumber} personas más pueden acceder antes de que retire esta información permanentemente. 🔒 Va contra todo lo establecido. ⚡ ¿Eres una de esas ${randomNumber}? 👆 Responde YA 🏃‍♀️`;
            }
            if (isDirectSale) {
                return `💰 PROPUESTA DIRECTA: ${keyword} me genera $${randomNumber}K/mes 📊 Te enseño el sistema por $297 (valor real $${randomNumber}97). 🎯 Incluye: ✅ Estrategia paso a paso ✅ Templates que uso ✅ Support 1:1 por ${randomTime} 🔥 Solo ${randomNumber} personas serias. ✅ "${randomNumber}" si estás dentro 💸`;
            }
            return `🚨 REVELACIÓN: ${keyword} cambió mi vida en ${randomTime}. 💥 Solo ${randomNumber} personas más pueden acceder antes de que retire esta información para siempre.`;
            
        case 'Instagram':
            if (isPositioning) {
                return `✨ AUTHENTIC GLOW UP: ${keyword} didn't just change my results... it transformed my entire energy 💫 Before: Seeking validation externally 🌟 Now: Radiating confidence from within 💎 The shift isn't in what I do, but in who I allow myself to be 🔥 When you align with your true essence, everything flows ✋ 💕 #AuthenticSelf #SelfLove #GlowUp #InnerWork #Confidence #SelfGrowth #Mindset #Transformation`;
            }
            if (isUrgency) {
                return `🚨 GIRLS! ${keyword} disappears in ${randomTime} 😭 💔 They're literally removing it from existence... ⏰ This changed my ENTIRE life y'all 💥 After ${randomTime} = gone FOREVER � If you've been thinking about it, THIS IS THE SIGN sis 🔥 ✨ Swipe to see my transformation 👆 Link in bio before it's too late ⚡ #LastChance #TransformationTuesday #LinkInBio #DontMissOut`;
            }
            if (isDirectSale) {
                return `💰 REAL NUMBERS: ${keyword} brought me $${randomNumber}K in ${randomTime} 📊 Not flexing, just transparency babe 💯 Ready for your financial glow up? ✅ Sistema que uso daily ✅ Templates exactos ✅ Exclusive support group 🔥 Solo ${randomNumber} boss babes ✨ Investment: $497 � DM "${randomNumber}" if you're serious about leveling up 👑 #MoneyMindset #FinancialFreedom #BossBabe #WealthBuilding`;
            }
            return `✨ PLOT TWIST: Probé ${keyword} expecting basic results... 😒 But this happened instead 💫 ${randomTime} later and I'm a completely different person 🌟 The glow up is REAL bestie`;
            
        case 'TikTok':
            if (isPositioning) {
                return `POV: You discover ${keyword} isn't a strategy... it's your new identity 💫 *aesthetic transformation music* When you stop trying to be someone else and embrace who you actually are 🔥 The confidence hits different ✨ #MainCharacterEnergy #AuthenticSelf #SelfGrowth #IdentityShift #Confidence #SelfLove`;
            }
            if (isUrgency) {
                return `THIS IS NOT A DRILL ‼️ ${keyword} vanishes in ${randomTime} 😭 I'm literally shaking... this saved my life 💔 If you've been waiting for a sign THIS IS IT ⚡ After ${randomTime} = gone forever 🚨 Link in bio RUN 🏃‍♀️ #Emergency #LastChance #LifeChanging #LinkInBio`;
            }
            if (isDirectSale) {
                return `Made $${randomNumber}K in ${randomTime} with ${keyword} 💰 Proof in my bio bestie ✨ Exactly what I did: ✅ This one strategy ✅ Zero followers needed ✅ Works from your phone 🔥 Teaching ${randomNumber} people max 💯 $297 gets you everything ⚡ Comment "${randomNumber}" if you're ready to secure the bag 💸 #MoneyTok #SideHustle #OnlineIncome`;
            }
            return `POV: You try ${keyword} expecting normal results... 👀 But THIS happened instead 🤯 *mind blown sound* Been shook for ${randomTime} 😱`;
            
        case 'Telegram':
            if (isPositioning) {
                return `🎯 FILOSOFÍA ESTRATÉGICA: ${keyword} como redefinición de ventaja competitiva sostenible 📊 Implementación requiere: • Mindset de early adopter • Visión estratégica (${randomTime}) • Tolerancia a experimentación controlada 💡 No es táctica, es filosofía operacional que redefine creación de valor. 🏆 Organizaciones que lo adoptaron reportan: • ${randomPercent} mejora en decision-making • Cultura de innovación más robusta • Posicionamiento de thought leadership sectorial 📈 ¿Su organización está preparada para liderar la próxima evolución?`;
            }
            if (isUrgency) {
                return `⚠️ ALERTA CRÍTICA: ${keyword} discontinuado en ${randomTime} 📉 Global supply chain disruption afecta disponibilidad hasta 2026 ⏰ Solo ${randomNumber} unidades en inventario mundial 🚨 Fortune 500 ya compraron stock para 3 años 💼 Precio aumenta ${randomPercent} post-deadline 📊 Ventana estratégica: ${randomTime} restantes ⚡ Decisión requerida NOW`;
            }
            if (isDirectSale) {
                return `💎 PROPUESTA EJECUTIVA: ${keyword} generó $${randomNumber}K revenue adicional ⚡ ROI documentado: ${randomPercent} en ${randomTime} 📊 Sistema replicable incluye: • Metodología step-by-step • Software propietario (licencia perpetua) • Consultoría estratégica 1:1 x ${randomTime} 🎯 Inversión: $4,997 (valor real $${randomNumber},997) 🤝 Solo ${randomNumber} organizaciones Q1 2025 📈 Payment plans available. Reply "EXECUTIVE" para detalles`;
            }
            return `📈 DATA EXCLUSIVO: ${keyword} adoption rate: +${randomPercent} en últimos ${randomTime} 📊 ROI promedio: ${randomPercent} en ${randomTime} ⚡ Success rate: ${randomPercent} con implementación correcta`;
            
        case 'Reddit':
            if (isPositioning) {
                return `The Philosophy Behind ${keyword} - More Than Optimization [${randomTime} Update] 🧠 After ${randomTime} of implementation, realized this isn't about skill acquisition - it's identity reconstruction. 💭 Traditional approaches treat it like a tool. Reality: it's a worldview shift. 📚 Real transformation: stop asking "How do I do this?" Start asking "Who do I become?" 🔄 Changed my relationship with success, failure, and progress fundamentally. What's your experience with identity-level transformations? Deep philosophical takes welcome 🤔`;
            }
            if (isUrgency) {
                return `PSA: ${keyword} program CONFIRMED shutting down ${randomTime} ⚠️ Not clickbait - verified by ${randomNumber} sources across multiple subreddits 📰 Creator retiring due to personal circumstances 😢 All materials, community access, future updates = gone after deadline ⏰ Current members scrambling to archive but legal restrictions apply 📋 Been on the fence? This is literally last chance ever 🚨 No extensions, no exceptions 💔 Payment processor cuts off ${randomTime} ⚡`;
            }
            if (isDirectSale) {
                return `${keyword} Income Report - $${randomNumber}K in ${randomTime} [Full Transparency] 💰 Started with $500, reinvested systematically, scaled methodically 📊 Proof, expenses, taxes documented in spreadsheet (comments) 🔍 What I'm offering: exact playbook I used. Not course, not coaching - just the system 📋 $497 one-time. No upsells, no recurring fees. Files + you're done ✅ Max ${randomNumber} people for quality control 🎯 FAQ in comments first please 👇`;
            }
            return `My ${keyword} Journey - ${randomTime} Later [Honest Review] 📝 TL;DR: Life-changing but NOT how expected. Started skeptical, tried it to prove it was BS... 💀 Plot twist: worked, but discovered something nobody mentions in success posts.`;
            
        case 'YouTube':
            if (isPositioning) {
                return `🎥 The TRUTH About ${keyword} - Building Authentic Influence (${randomTime} Journey) 🎯 ✅ Why ${randomPercent} get this completely wrong ✅ The identity shift that changes everything ✅ Building real influence vs fake guru tactics ✅ My ${randomTime} journey: unknown to thought leader ⚡ This isn't about tactics - it's becoming someone who naturally attracts opportunities 🌟 All resources free in description 📋 Zero sales, zero affiliates - pure value 💎`;
            }
            if (isUrgency) {
                return `🚨 BREAKING: ${keyword} Platform OFFICIALLY Shutting Down ${randomTime}! 😱 ⚠️ Announcement dropped ${randomTime} ago ⚠️ ⏰ ${randomNumber} million accounts deactivated ${randomTime} 📱 Users panicking to backup data 💾 Legal battles brewing but damage done 📰 ✅ Save your progress before too late ✅ Alternative platforms analysis ✅ Industry impact breakdown 🔥 WATCH before ${randomTime} or lose everything! ⚡ Emergency tutorial pinned 👇`;
            }
            if (isDirectSale) {
                return `💰 How I Made $${randomNumber}K With ${keyword} (${randomTime} Breakdown) 🎯 📊 Complete income + expenses (nothing hidden) 💻 Exact tools, software, systems I use daily ⚡ Why ${randomPercent} fail (how to be in top ${randomPercent}) 📋 Complete blueprint in description 🔥 $297 everything - no upsells, no BS 💎 ${randomNumber}+ student success stories (comments) ✅ 30-day guarantee if you follow system 🚀 Limited to ${randomNumber} students this month 👇`;
            }
            return `📺 ${keyword.toUpperCase()} From ZERO - What They DON'T Tell You (${randomTime} Guide) 🎯 ✅ Complete roadmap: beginner to expert ⚠️ Mistakes that cost me ${randomTime} (avoid these)`;
            
        default:
            return `💡 ${keyword} shifted my entire perspective in ${randomTime}. 🤔 What I discovered challenges everything we "know" about this topic. 🔥`;
    }
}

// FUNCIÓN PARA LLAMAR A DEEPSEEK API CON TIMEOUT
async function callDeepseekAPI(prompt) {
    console.log(`[DEEPSEEK] 🚀 Iniciando llamada...`);
    
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('TIMEOUT: Deepseek API tardó más de 20 segundos'));
        }, 20000);
    });
    
    const apiCall = async () => {
        try {
            const response = await axios.post(`${DEEPSEEK_ENDPOINTS[0]}/chat/completions`, {
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            
            console.log(`[DEEPSEEK] ✅ Respuesta recibida:`, response.status);
            
            if (response.data && response.data.choices && response.data.choices[0]) {
                const content = response.data.choices[0].message.content.trim();
                console.log(`[DEEPSEEK] ✅ Contenido generado: ${content.substring(0, 100)}...`);
                return content;
            } else {
                throw new Error('Respuesta de Deepseek vacía o malformada');
            }
        } catch (axiosError) {
            console.error(`[DEEPSEEK] ❌ Error en API:`, axiosError.message);
            if (axiosError.response) {
                console.error(`[DEEPSEEK] ❌ Status:`, axiosError.response.status);
                console.error(`[DEEPSEEK] ❌ Data:`, axiosError.response.data);
            }
            throw axiosError;
        }
    };
    
    return Promise.race([apiCall(), timeoutPromise]);
}

// FUNCIÓN PRINCIPAL PARA GENERAR IDEAS
exports.generateIdeas = functions
    .runWith({
        timeoutSeconds: 120,
        memory: '1GB'
    })
    .https.onCall(async (data, context) => {
        const requestId = Math.random().toString(36).substring(7);
        
        console.log(`[API-${requestId}] 🚀 Nueva solicitud`);
        
        try {
            const { keyword, platforms, userContext } = data;
            const uid = context.auth?.uid;

            if (!uid) {
                throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
            }

            if (!keyword || !platforms || platforms.length === 0) {
                throw new functions.https.HttpsError('invalid-argument', 'Keyword y platforms son requeridos');
            }

            // Límite de 3 redes sociales
            if (platforms.length > 3) {
                throw new functions.https.HttpsError('invalid-argument', 'Máximo 3 redes sociales');
            }

            const userRef = db.collection('users').doc(uid);
            
            // Validar usuario
            let userDoc;
            try {
                userDoc = await userRef.get();
            } catch (error) {
                console.log(`[API-${requestId}] Asumiendo usuario nuevo por error Firestore`);
                userDoc = { exists: false, data: () => ({}) };
            }

            const userData = userDoc.exists ? userDoc.data() : {};
            const isAdmin = userData.role === 'admin';
            const isPremium = userData.isPremium === true;
            const usageCount = userData.usageCount || 0;

            // Control de límites
            if (!isAdmin && !isPremium && usageCount >= 10) {
                throw new functions.https.HttpsError('permission-denied', 'Límite alcanzado. Upgrade a Premium.');
            }

            // Generar ideas usando Deepseek API (con fallback mejorado)
            const ideas = {};
            
            for (const platform of platforms) {
                console.log(`[API-${requestId}] Generando contenido para ${platform} con tipo: ${userContext}`);
                
                let useDeepseek = false; // Deshabilitar Deepseek temporalmente hasta validar API key
                
                if (useDeepseek) {
                    try {
                        // Construir prompt específico para Deepseek
                        const prompt = buildPromptForPlatform(platform, keyword, userContext);
                        console.log(`[API-${requestId}] Llamando a Deepseek API para ${platform}...`);
                        
                        // Llamar a Deepseek API
                        const deepseekResponse = await callDeepseekAPI(prompt);
                        
                        if (deepseekResponse && deepseekResponse.trim().length > 50) {
                            ideas[platform] = deepseekResponse.trim();
                            console.log(`[API-${requestId}] ✅ Deepseek exitoso para ${platform}: ${deepseekResponse.substring(0, 100)}...`);
                        } else {
                            console.log(`[API-${requestId}] ⚠️ Respuesta de Deepseek insuficiente para ${platform}, usando fallback`);
                            ideas[platform] = getExamplesForNetwork(platform, keyword, userContext);
                        }
                    } catch (deepseekError) {
                        console.log(`[API-${requestId}] ❌ Error en Deepseek para ${platform}: ${deepseekError.message}`);
                        console.log(`[API-${requestId}] 🔄 Usando fallback para ${platform}`);
                        ideas[platform] = getExamplesForNetwork(platform, keyword, userContext);
                    }
                } else {
                    console.log(`[API-${requestId}] 🔄 Usando templates mejorados para ${platform} (Deepseek deshabilitado)`);
                    ideas[platform] = getExamplesForNetwork(platform, keyword, userContext);
                }
            }

            // Actualizar contador
            if (!isAdmin) {
                try {
                    const newUsageCount = usageCount + 1;
                    const updateData = {
                        usageCount: newUsageCount,
                        lastUsage: admin.firestore.FieldValue.serverTimestamp()
                    };

                    if (!userDoc.exists) {
                        updateData.email = context.auth.token.email || 'unknown';
                        updateData.createdAt = admin.firestore.FieldValue.serverTimestamp();
                        updateData.isPremium = false;
                        updateData.role = 'user';
                    }

                    await userRef.set(updateData, { merge: true });
                } catch (error) {
                    console.log(`[API-${requestId}] Error actualizando contador: ${error.message}`);
                }
            }

            console.log(`[API-${requestId}] ✅ Generación exitosa`);
            
            return {
                success: true,
                ideas: ideas,
                remainingUses: isAdmin || isPremium ? 'unlimited' : Math.max(0, 10 - (usageCount + 1))
            };

        } catch (error) {
            console.error(`[API-${requestId}] ❌ Error:`, error);
            
            if (error instanceof functions.https.HttpsError) {
                throw error;
            }
            
            throw new functions.https.HttpsError('internal', 'Error interno del servidor');
        }
    });
