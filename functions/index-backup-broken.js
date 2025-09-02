const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Configuración de Deepseek API - Obtenida de Firebase Config y variables de entorno
console.log('[DEBUG] process.env.DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? 'SET' : 'NOT_SET');

let configValue;
try {
    configValue = functions.config().deepseek?.key;
    console.log('[DEBUG] functions.config().deepseek?.key:', configValue ? configValue.substring(0, 8) + '...' : 'NOT_SET');
} catch (error) {
    console.log('[DEBUG] Error accessing functions.config():', error.message);
    configValue = null;
}

// Solo usar env variable si es una API key real (no el placeholder)
const envKey = process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.startsWith('sk-') ? process.env.DEEPSEEK_API_KEY : null;
// API Key directa temporal mientras se configura Firebase Functions
const directKey = 'sk-195d3e74fc904857a632ee7b22b174ff';
const DEEPSEEK_API_KEY = envKey || configValue || directKey;
const DEEPSEEK_ENDPOINTS = [
    'https://api.deepseek.com/v1'
];

console.log('[DEBUG] Final DEEPSEEK_API_KEY:', DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(0, 8) + '...' : 'NOT_SET');

// Validar que tenemos la API key
if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_KEY.startsWith('sk-')) {
    console.warn('⚠️ DEEPSEEK_API_KEY no configurada correctamente.');
    console.warn('📝 Para usar Deepseek: configura con firebase functions:config:set deepseek.key=TU_API_KEY');
} else {
    console.log('[INIT] ✅ Deepseek API key configurada correctamente:', DEEPSEEK_API_KEY.substring(0, 8) + '...');
}

// FUNCIÓN PARA CONSTRUIR PROMPTS DINÁMICOS PARA DEEPSEEK
function buildPromptForPlatform(platform, keyword, userContext) {
    // Extraer el tipo de copy del userContext
    const copyType = userContext ? userContext.toLowerCase() : '';
    const isPositioning = copyType.includes('posicionamiento') || copyType.includes('branding');
    const isUrgency = copyType.includes('urgencia') || copyType.includes('escasez');
    const isDirectSale = copyType.includes('venta directa') || copyType.includes('persuasivo');
    
    // Detectar si debe incluir CTA o no
    const includeCTA = !copyType.includes('sin llamada a la acción') && !copyType.includes('contenido reflexivo');
    const ctaInstruction = includeCTA 
        ? 'INCLUIR llamada a la acción específica y persuasiva'
        : 'NO incluir llamada a la acción - contenido puramente reflexivo o informativo';
    
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
    
    return `Actúa como un copywriter experto en ${platform}.

KEYWORD: "${keyword}"
ESTRATEGIA: ${copyStrategy}
CTA INSTRUCTION: ${ctaInstruction}
CONTEXTO ADICIONAL: ${userContext}

ESPECIFICACIONES TÉCNICAS PARA ${platform}:
${getFormatSpecsForPlatform(platform)}

RESPONDE EN FORMATO JSON EXACTO:
{
  "contenido": "[COPY COMPLETO con emojis y hashtags integrados al final del texto]",
  "formatoVisual": "[DESCRIPCIÓN MUY ESPECÍFICA: dimensiones exactas, colores hex, tipografía, elementos visuales, estilo de imagen/video, props, escenario, iluminación - TODO para trabajar con IA generativa]",
  "cta": "[Call to action específico para ${platform} - SOLO si se requiere según CTA INSTRUCTION]"
}

REQUISITOS OBLIGATORIOS:
1. Contenido 100% único sobre "${keyword}" - NO usar plantillas genéricas
2. Tono: ${spec.tone}
3. Longitud: ${spec.length}
4. HASHTAGS integrados AL FINAL del contenido (no por separado)
5. FORMATO VISUAL obligatorio y específico al 100% para IA
6. Respuesta SOLO en JSON válido, sin markdown ni explicaciones
7. CTA: ${ctaInstruction}
8. CONTEXTO: Considera toda la información en "CONTEXTO ADICIONAL" para personalizar el contenido

CRÍTICO: formatoVisual debe ser súper específico para generar imagen/video con IA (dimensiones, colores, estilo, elementos, props, etc.)`;
}

// FUNCIÓN PARA OBTENER ESPECIFICACIONES DE FORMATO POR PLATAFORMA
function getFormatSpecsForPlatform(platform) {
    const formatSpecs = {
        'Facebook': `
- ESTRUCTURA: Gancho (1-2 líneas) + Historia personal + Valor/Aprendizaje + Pregunta de engagement
- PÁRRAFOS: Máximo 3-4 líneas por párrafo para facilitar lectura
- EMOJIS: 1-2 por párrafo, estratégicamente ubicados
- HASHTAGS: 3-5 hashtags relevantes al final
- CTA: Pregunta directa que invite a comentar
EJEMPLO ESTRUCTURA:
"[Gancho impactante] 🎯

[Historia o contexto personal]
[Párrafo con valor/insight]

[Pregunta de engagement] ⬇️
#hashtag1 #hashtag2 #hashtag3"`,

        'LinkedIn': `
- ESTRUCTURA: Hook profesional + Contexto + Insights + Llamada a acción profesional
- PÁRRAFOS: Párrafos cortos con bullets o números cuando sea relevante
- EMOJIS: Moderados, principalmente iconos profesionales
- HASHTAGS: 5-8 hashtags profesionales específicos del sector
- CTA: Invitación a networking, comentarios profesionales o conexión
EJEMPLO ESTRUCTURA:
"🎯 [Insight profesional]

✅ Punto clave 1
✅ Punto clave 2  
✅ Punto clave 3

[Reflexión profesional]

¿Qué opinan ustedes? 👇

#hashtag1 #hashtag2 #hashtag3 #hashtag4"`,

        'X / Twitter': `
- ESTRUCTURA: Thread format (si es necesario) o tweet único impactante
- LÍMITE: 280 caracteres máximo
- EMOJIS: 2-3 máximo, muy específicos
- HASHTAGS: 2-3 hashtags trending o específicos
- CTA: Retweet, reply o engagement directo
EJEMPLO ESTRUCTURA:
"🔥 [Statement impactante]

[Explicación breve]

[CTA directa] 👇

#hashtag1 #hashtag2"`,

        'Instagram': `
- ESTRUCTURA: Gancho visual + Historia aspiracional + Transformación + CTA para stories
- PÁRRAFOS: Líneas cortas, muy visual, espaciado amplio
- EMOJIS: Abundantes pero estéticos, alineados con el mood
- HASHTAGS: 10-15 hashtags específicos del nicho
- CTA: Guiar a stories, DM o guardar post
EJEMPLO ESTRUCTURA:
"✨ [Gancho aspiracional]

💫 [Historia de transformación]

🌟 [Momento de revelación]

💕 [CTA emocional]

#hashtag1 #hashtag2 #hashtag3 ... (hasta 15)"`,

        'WhatsApp': `
- ESTRUCTURA: Mensaje personal directo + Urgencia + CTA inmediata
- FORMATO: Sin párrafos largos, como mensaje de texto real
- EMOJIS: Casual, como conversación real
- HASHTAGS: NO usar hashtags (no es apropiado para WhatsApp)
- CTA: Respuesta inmediata, acción directa
EJEMPLO ESTRUCTURA:
"🚨 [Mensaje urgente personalizado]

[Contexto breve]

[Beneficio directo]

¿Estás interesad@? 
Responde YA 👆"`,

        'TikTok': `
- ESTRUCTURA: Hook viral + Storyline rápida + Revelation + CTA trend
- FORMATO: Texto para caption, no para audio
- EMOJIS: Trending, generacionales
- HASHTAGS: 3-5 hashtags trending + específicos
- CTA: Duetos, comentarios, shares
EJEMPLO ESTRUCTURA:
"POV: [Situación relatable] 👀

✨ [Plot twist o revelación]

Tell me you relate 💅

#hashtag1 #trending #relatable"`,

        'Telegram': `
- ESTRUCTURA: Análisis profesional + Data + Insights + CTA exclusivo
- FORMATO: Texto denso, informativo, premium content
- EMOJIS: Íconos informativos y técnicos
- HASHTAGS: 2-3 hashtags técnicos o de nicho
- CTA: Forwarding, discusión analítica
EJEMPLO ESTRUCTURA:
"📊 [Análisis técnico]

📈 Data points importantes:
• Punto 1
• Punto 2

💡 [Insight clave]

#hashtag1 #hashtag2"`,

        'Reddit': `
- ESTRUCTURA: Título honesto + Contexto detallado + Story + Lessons learned
- FORMATO: Como post genuino de Reddit, auténtico
- EMOJIS: Mínimos, solo cuando es natural
- HASHTAGS: NO usar hashtags (no es estilo Reddit)
- CTA: Upvotes, comentarios, compartir experiencias
EJEMPLO ESTRUCTURA:
"[Honest title] - My experience with [tema]

Context: [Background story]

What happened: [Detailed experience]

What I learned: [Key insights]

Has anyone else experienced this?"`,

        'YouTube': `
- ESTRUCTURA: Hook para thumbnail + Promesa de valor + Preview + CTA suscripción
- FORMATO: Descripción de video optimizada para algoritmo
- EMOJIS: Para separar secciones y llamar atención
- HASHTAGS: 3-5 hashtags de YouTube específicos
- CTA: Suscribirse, activar notificaciones, comentar
EJEMPLO ESTRUCTURA:
"🎯 [Hook que coincida con thumbnail]

En este video aprenderás:
✅ Punto 1
✅ Punto 2
✅ Punto 3

[Preview del contenido más valioso]

👇 SUSCRÍBETE y activa las notificaciones

#hashtag1 #hashtag2 #hashtag3"`
    };

    return formatSpecs[platform] || formatSpecs['Facebook'];
}

// FUNCIÓN PARA GENERAR HASHTAGS ESPECÍFICOS POR PLATAFORMA
function generateHashtagsForPlatform(platform, keyword) {
    const baseKeyword = keyword.toLowerCase().replace(/\s+/g, '').substring(0, 12);
    
    const hashtagsByPlatform = {
        'Facebook': [
            `#${baseKeyword}`,
            `#${baseKeyword}tips`,
            `#crecimientopersonal`,
            `#motivacion`,
            `#exito`
        ],
        'LinkedIn': [
            `#${baseKeyword}`,
            `#liderazgo`,
            `#desarrolloprofesional`,
            `#networking`,
            `#crecimientoempresarial`,
            `#productividad`,
            `#estrategia`,
            `#innovacion`
        ],
        'X / Twitter': [
            `#${baseKeyword}`,
            `#tips`,
            `#Thread`
        ],
        'Instagram': [
            `#${baseKeyword}`,
            `#${baseKeyword}tips`,
            `#motivation`,
            `#lifestyle`,
            `#selfcare`,
            `#mindset`,
            `#inspiration`,
            `#wellness`,
            `#growth`,
            `#transformation`,
            `#positivevibes`,
            `#selfimprovement`,
            `#success`,
            `#entrepreneur`,
            `#personaldevelopment`
        ],
        'WhatsApp': [], // WhatsApp no usa hashtags
        'TikTok': [
            `#${baseKeyword}`,
            `#fyp`,
            `#viral`,
            `#trending`,
            `#tips`
        ],
        'Telegram': [
            `#${baseKeyword}`,
            `#analisis`,
            `#data`
        ],
        'Reddit': [], // Reddit no usa hashtags tradicionales
        'YouTube': [
            `#${baseKeyword}`,
            `#tutorial`,
            `#howto`
        ]
    };

    const platformHashtags = hashtagsByPlatform[platform] || hashtagsByPlatform['Facebook'];
    
    // Para Instagram, devolver más hashtags
    if (platform === 'Instagram') {
        return platformHashtags.slice(0, 15);
    }
    
    // Para otras plataformas, limitar según sus características
    if (platform === 'LinkedIn') {
        return platformHashtags.slice(0, 8);
    }
    
    if (platform === 'X / Twitter') {
        return platformHashtags.slice(0, 3);
    }
    
    return platformHashtags.slice(0, 5);
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

/**
 * Diagnostica y clasifica errores de DeepSeek para reportar al usuario
 */
function diagnoseDeepseekError(error, apiKey) {
    console.log('[ERROR_DIAGNOSIS] Analizando error de DeepSeek:', error.message);
    
    // Verificar API Key
    if (!apiKey || !apiKey.startsWith('sk-')) {
        return {
            type: 'API_KEY_MISSING',
            userMessage: 'Configuración de IA incompleta',
            technicalMessage: 'API Key de DeepSeek no configurada correctamente',
            canUseTemplates: false,
            severity: 'high'
        };
    }
    
    // Verificar errores de conexión
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message.includes('network')) {
        return {
            type: 'NETWORK_ERROR',
            userMessage: 'Sin conexión a internet',
            technicalMessage: 'No se pudo conectar con el servidor de IA. Verifica tu conexión a internet.',
            canUseTemplates: true,
            severity: 'medium'
        };
    }
    
    // Verificar timeout - SER MÁS ESTRICTO
    if (error.code === 'ECONNABORTED' || error.message.includes('TIMEOUT') || error.message.includes('timeout') || error.message.includes('aborted')) {
        return {
            type: 'TIMEOUT_ERROR',
            userMessage: 'Tiempo de espera agotado',
            technicalMessage: 'La IA tardó demasiado en responder (más de 25 segundos). Reintentando...',
            canUseTemplates: false, // CAMBIO: No usar templates para timeouts, reintentar
            severity: 'medium'
        };
    }
    
    // Verificar límites de API - SER MÁS ESTRICTO
    if (error.message.includes('RATE_LIMIT') || error.message.includes('429') || error.message.includes('Too many requests')) {
        return {
            type: 'RATE_LIMIT_ERROR',
            userMessage: 'Límite de solicitudes excedido',
            technicalMessage: 'Se han realizado demasiadas solicitudes a la IA. Esperando y reintentando...',
            canUseTemplates: false, // CAMBIO: No usar templates para rate limits, reintentar
            severity: 'medium'
        };
    }
    
    // Verificar errores de autenticación
    if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('API_ERROR: Status 401')) {
        return {
            type: 'AUTH_ERROR',
            userMessage: 'Credenciales de IA inválidas',
            technicalMessage: 'La API Key de DeepSeek es inválida o ha expirado.',
            canUseTemplates: false,
            severity: 'high'
        };
    }
    
    // Verificar errores del servidor de IA
    if (error.message.includes('API_ERROR') || error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
        return {
            type: 'SERVER_ERROR',
            userMessage: 'Servidor de IA temporalmente no disponible',
            technicalMessage: 'El servidor de DeepSeek está experimentando problemas. Intenta de nuevo en unos minutos.',
            canUseTemplates: true,
            severity: 'medium'
        };
    }
    
    // Verificar respuesta vacía o inválida
    if (error.message.includes('EMPTY_RESPONSE') || error.message.includes('CONTENT_TOO_SHORT') || error.message.includes('RESPUESTA_INSUFICIENTE')) {
        return {
            type: 'INVALID_RESPONSE',
            userMessage: 'Respuesta de IA inválida',
            technicalMessage: 'La IA devolvió una respuesta vacía o muy corta. Intenta con una descripción más específica.',
            canUseTemplates: true,
            severity: 'low'
        };
    }
    
    // Error genérico
    return {
        type: 'UNKNOWN_ERROR',
        userMessage: 'Error inesperado con la IA',
        technicalMessage: `Error no clasificado: ${error.message}`,
        canUseTemplates: true,
        severity: 'medium'
    };
}

// FUNCIÓN PARA LLAMAR A DEEPSEEK API CON TIMEOUT Y RETRY OPTIMIZADO
// FUNCIÓN MEJORADA CON REINTENTOS AUTOMÁTICOS - ULTRA AGRESIVA PARA EVITAR PLANTILLAS
async function callDeepseekAPIWithRetry(prompt, platform = 'unknown', maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[DEEPSEEK] 🚀 Intento AGRESIVO ${attempt}/${maxRetries} para ${platform}...`);
            const result = await callDeepseekAPI(prompt);
            console.log(`[DEEPSEEK] ✅ Éxito en intento ${attempt} para ${platform}`);
            return result;
        } catch (error) {
            console.log(`[DEEPSEEK] ❌ Intento ${attempt}/${maxRetries} falló para ${platform}: ${error.message}`);
            
            // Para timeouts y rate limits, siempre reintentar si no es el último intento
            if (attempt < maxRetries && (error.message.includes('TIMEOUT') || error.message.includes('429') || error.message.includes('RATE_LIMIT'))) {
                const waitTime = 1000 * attempt; // Espera incremental
                console.log(`[DEEPSEEK] ⏰ Esperando ${waitTime}ms antes del reintento...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            if (attempt === maxRetries) {
                console.log(`[DEEPSEEK] 💔 Todos los intentos AGRESIVOS fallaron para ${platform}`);
                throw error;
            }
            
            // Pausa mínima antes del reintento para otros errores
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
}

async function callDeepseekAPI(prompt) {
    console.log(`[DEEPSEEK] 🚀 Iniciando llamada optimizada...`);
    
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('TIMEOUT: Deepseek API tardó más de 20 segundos'));
        }, 20000); // Reducido a 20 segundos para mejor rendimiento
    });
    
    const apiCall = async () => {
        try {
            const requestData = {
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2500, // Aumentado para respuestas completas con formato visual
                temperature: 0.8,
                top_p: 0.9,
                stream: false
            };
            
            console.log(`[DEEPSEEK] 📡 Enviando request con timeout extendido...`);
            
            const response = await axios.post(`${DEEPSEEK_ENDPOINTS[0]}/chat/completions`, requestData, {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Firebase-Functions/1.0'
                },
                timeout: 23000, // 23 segundos - optimizado para completar antes del timeout de Cloud Function
                validateStatus: (status) => status < 500
            });
            
            console.log(`[DEEPSEEK] ✅ Respuesta recibida:`, response.status);
            
            if (response.status === 429) {
                throw new Error('RATE_LIMIT: Too many requests');
            }
            
            if (response.status >= 400) {
                throw new Error(`API_ERROR: Status ${response.status}`);
            }
            
            if (response.data && response.data.choices && response.data.choices[0]) {
                const content = response.data.choices[0].message.content.trim();
                console.log(`[DEEPSEEK] ✅ Contenido generado: ${content.substring(0, 50)}...`);
                
                if (content.length < 20) {
                    throw new Error('CONTENT_TOO_SHORT: Respuesta muy corta');
                }
                
                // Intentar parsear como JSON, si falla devolver como texto plano
                try {
                    const jsonContent = JSON.parse(content);
                    console.log(`[DEEPSEEK] ✅ JSON válido detectado`);
                    return jsonContent;
                } catch (jsonError) {
                    console.log(`[DEEPSEEK] ⚠️ No es JSON válido, devolviendo como texto plano`);
                    return { contenido: content, hashtags: [], cta: '', formato: 'text' };
                }
            } else {
                throw new Error('EMPTY_RESPONSE: Respuesta vacía');
            }
        } catch (axiosError) {
            console.error(`[DEEPSEEK] ❌ Error en API:`, axiosError.message);
            throw axiosError;
        }
    };
    
    return Promise.race([apiCall(), timeoutPromise]);
}

// FUNCIÓN PRINCIPAL PARA GENERAR IDEAS - OPTIMIZADA PARA EVITAR PLANTILLAS
exports.generateIdeas = functions
    .runWith({
        timeoutSeconds: 60, // Reducido a 60 segundos (máximo de Firebase)
        memory: '512MB' // Reducido para mejor performance
    })
    .https.onRequest(async (req, res) => {
        return cors(req, res, async () => {
            const requestId = Math.random().toString(36).substring(7);
            
            console.log(`[API-${requestId}] 🚀 Nueva solicitud`);
            
            try {
                // Verificar método HTTP
                if (req.method !== 'POST') {
                    res.status(405).json({ error: 'Method not allowed' });
                    return;
                }
                
                const { keyword, platform, copyTypes, userContext, uid } = req.body.data || req.body;
                
                if (!uid) {
                    res.status(401).json({ error: 'Usuario no autenticado' });
                    return;
                }

                if (!keyword || !platform || !copyTypes || copyTypes.length === 0) {
                    res.status(400).json({ error: 'Keyword, platform y copyTypes son requeridos' });
                    return;
                }

                if (copyTypes.length > 3) {
                    res.status(400).json({ error: 'Máximo 3 tipos de copy permitidos' });
                    return;
                }

            // Nueva lógica: 3 ideas para 1 plataforma con diferentes tipos de copy
            console.log(`[API-${requestId}] 🎯 Generando 3 ideas para ${platform} con tipos: [${copyTypes.join(', ')}]`);
            
            // Distribución inteligente de tipos de copy
            let copyTypeDistribution = [];
            if (copyTypes.length === 1) {
                // 3 variaciones del mismo tipo
                copyTypeDistribution = [copyTypes[0], copyTypes[0], copyTypes[0]];
            } else if (copyTypes.length === 2) {
                // 2 del primero + 1 del segundo
                copyTypeDistribution = [copyTypes[0], copyTypes[0], copyTypes[1]];
            } else if (copyTypes.length === 3) {
                // 1 de cada tipo
                copyTypeDistribution = [copyTypes[0], copyTypes[1], copyTypes[2]];
            }
            
            console.log(`[API-${requestId}] 📋 Distribución: [${copyTypeDistribution.join(', ')}]`);

            // Control de límites
            if (!isAdmin && !isPremium && usageCount >= 10) {
                res.status(401).json({ error: 'Límite alcanzado. Upgrade a Premium.' });
                return;
            }

            // Generar las 3 ideas usando Deepseek API
            const ideas = {};
            
            // Verificar disponibilidad de Deepseek
            const useDeepseek = DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.startsWith('sk-');
            console.log(`[API-${requestId}] 🔍 Deepseek disponible: ${useDeepseek ? 'SÍ' : 'NO'}`);
            
            // 🚀 GENERACIÓN PARALELA DE 3 IDEAS
            console.log(`[API-${requestId}] 🚀 Iniciando generación PARALELA de 3 ideas para ${platform}`);
            
            const ideaPromises = copyTypeDistribution.map(async (copyType, index) => {
                const ideaNumber = index + 1;
                console.log(`[API-${requestId}] Generando idea ${ideaNumber} para ${platform} con tipo: ${copyType}`);
                
                try {
                    if (useDeepseek) {
                        // Prompt personalizado para cada idea
                        const prompt = buildPromptForPlatform(platform, keyword, copyType);
                        console.log(`[API-${requestId}] 🚀 Llamando a Deepseek API para idea ${ideaNumber}...`);
                        
                        const deepseekResponse = await callDeepseekAPIWithRetry(prompt, `${platform}-idea${ideaNumber}`);
                        
                        if (deepseekResponse && (deepseekResponse.contenido || deepseekResponse.length > 30)) {
                            if (deepseekResponse.contenido) {
                                return {
                                    ideaNumber,
                                    copyType,
                                    content: {
                                        rawContent: deepseekResponse.contenido,
                                        hashtags: deepseekResponse.hashtags || [],
                                        cta: deepseekResponse.cta || '',
                                        formatoVisual: deepseekResponse.formatoVisual || '',
                                        formato: platform
                                    }
                                };
                            } else {
                                return {
                                    ideaNumber,
                                    copyType,
                                    content: {
                                        rawContent: deepseekResponse.trim(),
                                        hashtags: generateHashtagsForPlatform(platform, keyword),
                                        cta: '',
                                        formatoVisual: generateVisualFormatForPlatform(platform, keyword),
                                        formato: platform
                                    }
                                };
                            }
                        } else {
                            throw new Error('RESPUESTA_INSUFICIENTE');
                        }
                    } else {
                        // Usar templates de fallback
                        console.log(`[API-${requestId}] 🔄 Usando contenido de respaldo para idea ${ideaNumber}`);
                        const fallbackContent = getExamplesForNetwork(platform, keyword, copyType);
                        const fallbackHashtags = generateHashtagsForPlatform(platform, keyword);
                        const fallbackVisual = generateVisualFormatForPlatform(platform, keyword);
                        
                        return {
                            ideaNumber,
                            copyType,
                            content: {
                                rawContent: `⚠️ GENERADO CON TEMPLATES (API no configurada)\n\n${fallbackContent}`,
                                hashtags: fallbackHashtags,
                                cta: '',
                                formatoVisual: fallbackVisual,
                                formato: platform,
                                isFallback: true,
                                errorType: 'API_KEY_MISSING',
                                errorMessage: 'API Key no configurada'
                            }
                        };
                    }
                } catch (deepseekError) {
                    console.log(`[API-${requestId}] ❌ Error en Deepseek para idea ${ideaNumber}: ${deepseekError.message}`);
                    
                    const errorDiagnosis = diagnoseDeepseekError(deepseekError, DEEPSEEK_API_KEY);
                    console.log(`[API-${requestId}] 🔍 Diagnóstico: ${errorDiagnosis.type} - ${errorDiagnosis.technicalMessage}`);
                    
                    if (!errorDiagnosis.canUseTemplates) {
                        throw new Error(`❌ ${errorDiagnosis.userMessage}: ${errorDiagnosis.technicalMessage}`);
                    }
                    
                    const fallbackContent = getExamplesForNetwork(platform, keyword, copyType);
                    const fallbackHashtags = generateHashtagsForPlatform(platform, keyword);
                    const fallbackVisual = generateVisualFormatForPlatform(platform, keyword);
                    
                    return {
                        ideaNumber,
                        copyType,
                        content: {
                            rawContent: `⚠️ GENERADO CON TEMPLATES (${errorDiagnosis.userMessage})\n\n${fallbackContent}`,
                            hashtags: fallbackHashtags,
                            cta: '',
                            formatoVisual: fallbackVisual,
                            formato: platform,
                            isFallback: true,
                            errorType: errorDiagnosis.type,
                            errorMessage: errorDiagnosis.userMessage
                        }
                    };
                }
            });

            // Esperar a que TODAS las ideas terminen en paralelo
            const ideaResults = await Promise.all(ideaPromises);
            
            // Organizar resultados por número de idea
            ideaResults.forEach(({ ideaNumber, copyType, content }) => {
                ideas[`idea_${ideaNumber}`] = {
                    ...content,
                    copyType: copyType,
                    platform: platform
                };
                const hashtagCount = content.hashtags?.length || 0;
                console.log(`[API-${requestId}] ✅ Idea ${ideaNumber} lista para ${platform} (${copyType}) con ${hashtagCount} hashtags`);
            });

            // Obtener datos del usuario para actualizar contador
            const userRef = db.collection('users').doc(uid);
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

            // Actualizar contador
            if (!isAdmin) {
                try {
                    const newUsageCount = usageCount + 1;
                    const updateData = {
                        usageCount: newUsageCount,
                        lastUsage: admin.firestore.FieldValue.serverTimestamp()
                    };

                    if (!userDoc.exists) {
                        updateData.email = 'web-user@brain-storm.com';
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
            
            res.status(200).json({
                data: {
                    success: true,
                    ideas: ideas,
                    remainingUses: isAdmin || isPremium ? 'unlimited' : Math.max(0, 10 - (usageCount + 1))
                }
            });

        } catch (error) {
            console.error(`[API-${requestId}] ❌ Error:`, error);
            
            res.status(500).json({
                error: {
                    code: 'internal',
                    message: 'Error interno del servidor',
                    details: error.message
                }
            });
        }
        });
    });

// FUNCIÓN PARA GENERAR FORMATO VISUAL ESPECÍFICO PARA IA - VERSIÓN MEJORADA CON ESPECIFICACIONES DE IDIOMA
function generateVisualFormatForPlatform(platform, keyword) {
    const visualSpecs = {
        'Facebook': `📱 FORMATO PARA IA: Post cuadrado 1080x1080px, colores vibrantes (#3b82f6, #ffffff), tipografía bold Sans-serif perfectamente legible, imagen de persona sonriendo en ambiente cálido, iluminación natural dorada, props: laptop/café. TEXTO OBLIGATORIO: en español latino perfecto, sin errores ortográficos, gramática impecable, acentos correctos, frases naturales. Tipografía grande (mín. 28px), alto contraste, fondo sólido detrás del texto para máxima legibilidad. Resultado: imagen perfecta al primer intento, lista para publicar sin correcciones.`,
        
        'LinkedIn': `💼 FORMATO PARA IA: Post profesional 1080x1350px, paleta azul corporativo (#0077b5, #ffffff), tipografía moderna Helvetica ultra-legible, persona en oficina moderna o coworking, iluminación profesional clara, props: documentos/gráficos de éxito, vestimenta business casual. TEXTO OBLIGATORIO: en español latino profesional perfecto, terminología empresarial correcta, sin errores gramaticales, acentuación impecable. Tipografía corporativa limpia (mín. 26px), espaciado generoso, contraste óptimo. Resultado: post profesional perfecto al primer intento.`,
        
        'X / Twitter': `🐦 FORMATO PARA IA: Header 1200x675px, diseño minimalista impactante, colores contrastantes (#1da1f2, #000000), tipografía bold ultra-legible, imagen conceptual relacionada con "${keyword}", elementos gráficos simples pero efectivos. TEXTO OBLIGATORIO: en español latino conciso y perfecto, sin errores de ningún tipo, puntuación correcta, frases directas y naturales. Tipografía grande y bold (mín. 32px), máximo contraste, fondo que resalte el texto. Resultado: tweet visual perfecto al primer intento.`,
        
        'Instagram': `📸 FORMATO PARA IA: Cuadrado 1080x1080px, estética aspiracional perfecta, colores Instagram trending (#e4405f, gradientes), tipografía script elegante pero legible, lifestyle shot relacionado con "${keyword}", iluminación golden hour profesional, props estéticos, composición regla de tercios. TEXTO OBLIGATORIO: en español latino inspiracional perfecto, sin errores ortográficos, acentos correctos, frases motivacionales naturales. Tipografía decorativa pero legible (mín. 30px), texto con sombra o contorno, fondo que destaque las palabras. Resultado: post Instagram perfecto al primer intento.`,
        
        'WhatsApp': `💬 FORMATO PARA IA: Mensaje visual 800x600px, diseño casual como screenshot auténtico, colores WhatsApp (#25d366, #ffffff), tipografía de chat real, mockup de conversación sobre "${keyword}", burbujas de mensaje realistas, hora actual. TEXTO OBLIGATORIO: en español latino coloquial perfecto, sin errores de escritura, contracciones naturales, expresiones auténticas latinoamericanas. Tipografía clara de chat (16px mínimo), burbujas con buen contraste. Resultado: mensaje WhatsApp perfecto al primer intento.`,
        
        'TikTok': `🎵 FORMATO PARA IA: Video vertical 1080x1920px, colores vibrantes trending ultra-llamativos, tipografía bold perfectamente visible, escena dinámica sobre "${keyword}", iluminación TikTok ring light, movimiento fluido, text overlay llamativo, estilo Gen Z. TEXTO OBLIGATORIO: en español latino juvenil perfecto, jerga actual latinoamericana, sin errores ortográficos, expresiones naturales de redes sociales. Tipografía grande y bold (mín. 36px), colores neón contrastantes, texto con borde o sombra para máxima visibilidad. Resultado: video TikTok perfecto al primer intento.`,
        
        'Telegram': `📡 FORMATO PARA IA: Mensaje canal 1280x720px, diseño premium oscuro profesional, colores Telegram (#0088cc, #2c2c2c), tipografía tech moderna ultra-legible, gráficos de datos sobre "${keyword}", estilo analytical dashboard, elementos informativos. TEXTO OBLIGATORIO: en español latino técnico perfecto, terminología especializada correcta, sin errores gramaticales, acentuación impecable. Tipografía monospace o sans-serif (mín. 24px), alto contraste sobre fondo oscuro, espaciado generoso. Resultado: mensaje Telegram perfecto al primer intento.`,
        
        'Reddit': `🤓 FORMATO PARA IA: Post discussion 1200x800px, diseño simple Reddit-style auténtico, colores (#ff4500, #ffffff), tipografía clara perfectamente readable, imagen auténtica sin overproduction sobre "${keyword}", estilo casual genuino, elementos community-focused. TEXTO OBLIGATORIO: en español latino casual perfecto, tono conversacional natural, sin errores de escritura, expresiones de comunidad latinoamericana. Tipografía simple y clara (mín. 20px), contraste perfecto, diseño limpio. Resultado: post Reddit perfecto al primer intento.`,
        
        'YouTube': `📺 FORMATO PARA IA: Thumbnail 1280x720px, colores llamativos high-contrast ultra-impactantes, tipografía YouTube bold perfectamente legible, composición clickbait profesional sobre "${keyword}", rostro expresivo, elementos gráficos llamativos, texto overlay impactante, estilo YouTuber exitoso. TEXTO OBLIGATORIO: en español latino llamativo perfecto, frases de impacto naturales, sin errores ortográficos, acentuación correcta, expresiones que generan clicks. Tipografía XXL bold (mín. 40px), colores neón contrastantes, texto con borde grueso, máxima visibilidad. Resultado: thumbnail YouTube perfecto al primer intento, ready para monetizar.`
    };
    
    return visualSpecs[platform] || visualSpecs['Facebook'];
}

// FUNCIÓN DE DIAGNÓSTICO MANUAL DE DEEPSEEK
exports.testDeepseekConnection = functions
    .runWith({
        timeoutSeconds: 30,
        memory: '256MB'
    })
    .https.onRequest(async (req, res) => {
        return cors(req, res, async () => {
            if (!req.headers.authorization) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }

    const requestId = Date.now().toString().slice(-6);
    console.log(`[TEST-${requestId}] Iniciando diagnóstico de DeepSeek...`);

    const diagnostics = {
        timestamp: new Date().toISOString(),
        tests: {},
        overall: 'unknown'
    };

    try {
        // Test 1: API Key Configuration
        console.log(`[TEST-${requestId}] 1. Verificando configuración de API Key...`);
        if (!DEEPSEEK_API_KEY) {
            diagnostics.tests.apiKey = {
                status: 'fail',
                message: 'API Key no configurada',
                details: 'La variable de entorno DEEPSEEK_API_KEY no está configurada'
            };
        } else if (!DEEPSEEK_API_KEY.startsWith('sk-')) {
            diagnostics.tests.apiKey = {
                status: 'fail',
                message: 'API Key inválida',
                details: 'La API Key no tiene el formato correcto (debe empezar con "sk-")'
            };
        } else {
            diagnostics.tests.apiKey = {
                status: 'pass',
                message: 'API Key configurada correctamente',
                details: `Key presente: ${DEEPSEEK_API_KEY.substring(0, 8)}...`
            };
        }

        // Test 2: Network Connectivity
        console.log(`[TEST-${requestId}] 2. Verificando conectividad de red...`);
        try {
            const axios = require('axios');
            const testResponse = await axios.get('https://api.deepseek.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY || 'test-key'}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000,
                validateStatus: () => true // Aceptar cualquier status para análisis
            });

            if (testResponse.status === 200) {
                diagnostics.tests.network = {
                    status: 'pass',
                    message: 'Conectividad exitosa',
                    details: `Servidor responde correctamente (${testResponse.status})`
                };
            } else if (testResponse.status === 401) {
                diagnostics.tests.network = {
                    status: 'partial',
                    message: 'Red OK, pero credenciales inválidas',
                    details: `Servidor alcanzable pero API Key incorrecta (${testResponse.status})`
                };
            } else {
                diagnostics.tests.network = {
                    status: 'fail',
                    message: 'Error del servidor',
                    details: `Servidor responde con error ${testResponse.status}`
                };
            }
        } catch (networkError) {
            if (networkError.code === 'ENOTFOUND' || networkError.code === 'ECONNREFUSED') {
                diagnostics.tests.network = {
                    status: 'fail',
                    message: 'Sin conexión a internet',
                    details: 'No se puede alcanzar el servidor de DeepSeek'
                };
            } else if (networkError.code === 'ECONNABORTED') {
                diagnostics.tests.network = {
                    status: 'fail',
                    message: 'Timeout de conexión',
                    details: 'El servidor tardó demasiado en responder'
                };
            } else {
                diagnostics.tests.network = {
                    status: 'fail',
                    message: 'Error de red',
                    details: networkError.message
                };
            }
        }

        // Test 3: API Functionality (solo si los tests anteriores pasan)
        if (diagnostics.tests.apiKey.status === 'pass' && 
            (diagnostics.tests.network.status === 'pass' || diagnostics.tests.network.status === 'partial')) {
            console.log(`[TEST-${requestId}] 3. Verificando funcionalidad de API...`);
            try {
                const testPrompt = 'Responde solo con "OK" si este mensaje se recibe correctamente.';
                const response = await callDeepseekAPI(testPrompt);
                
                if (response && response.trim().length > 0) {
                    diagnostics.tests.apiFunction = {
                        status: 'pass',
                        message: 'API funciona correctamente',
                        details: `Respuesta recibida: "${response.substring(0, 50)}..."`
                    };
                } else {
                    diagnostics.tests.apiFunction = {
                        status: 'fail',
                        message: 'Respuesta vacía',
                        details: 'La API responde pero no devuelve contenido'
                    };
                }
            } catch (apiError) {
                const errorDiagnosis = diagnoseDeepseekError(apiError, DEEPSEEK_API_KEY);
                diagnostics.tests.apiFunction = {
                    status: 'fail',
                    message: errorDiagnosis.userMessage,
                    details: errorDiagnosis.technicalMessage
                };
            }
        } else {
            diagnostics.tests.apiFunction = {
                status: 'skip',
                message: 'Saltado por fallos anteriores',
                details: 'No se puede probar la API sin configuración válida'
            };
        }

        // Determinar estado general
        const failedTests = Object.values(diagnostics.tests).filter(test => test.status === 'fail').length;
        const skippedTests = Object.values(diagnostics.tests).filter(test => test.status === 'skip').length;
        const totalTests = Object.keys(diagnostics.tests).length - skippedTests;

        if (failedTests === 0) {
            diagnostics.overall = 'healthy';
        } else if (failedTests <= totalTests / 2) {
            diagnostics.overall = 'degraded';
        } else {
            diagnostics.overall = 'unhealthy';
        }

        console.log(`[TEST-${requestId}] ✅ Diagnóstico completado: ${diagnostics.overall}`);
        
        return {
            success: true,
            diagnostics: diagnostics,
            summary: `Estado: ${diagnostics.overall} (${Object.keys(diagnostics.tests).length - skippedTests} tests ejecutados, ${failedTests} fallos)`
        };

    } catch (error) {
        console.error(`[TEST-${requestId}] ❌ Error en diagnóstico:`, error.message);
        return {
            success: false,
            error: error.message,
            diagnostics: diagnostics
        };
    }
});

// Función auxiliar para generar contenido de una plataforma específica
async function generateContentForPlatform(platform, keyword, userContext, useDeepseek, DEEPSEEK_API_KEY, requestId) {
    console.log(`[API-${requestId}] Generando contenido para ${platform} con tipo: ${userContext}`);
    
    if (useDeepseek) {
        // Sistema de reintentos para DeepSeek
        let attempt = 1;
        const maxAttempts = 2;
        
        while (attempt <= maxAttempts) {
            try {
                console.log(`[API-${requestId}] 🚀 Llamando a Deepseek API para ${platform} (intento ${attempt}/${maxAttempts})...`);
                
                // Una sola llamada optimizada por plataforma
                const prompt = buildPromptForPlatform(platform, keyword, userContext);
                const deepseekResponse = await callDeepseekAPI(prompt);
                
                if (deepseekResponse && (deepseekResponse.contenido || deepseekResponse.length > 30)) {
                    // Manejar respuesta estructurada de Deepseek
                    if (deepseekResponse.contenido) {
                        // Respuesta JSON estructurada
                        console.log(`[API-${requestId}] ✅ Deepseek JSON exitoso para ${platform} con ${deepseekResponse.hashtags?.length || 0} hashtags (intento ${attempt})`);
                        return {
                            rawContent: deepseekResponse.contenido,
                            hashtags: deepseekResponse.hashtags || [],
                            cta: deepseekResponse.cta || '',
                            formato: platform
                        };
                    } else {
                        // Respuesta de texto plano (fallback)
                        console.log(`[API-${requestId}] ✅ Deepseek texto exitoso para ${platform} (intento ${attempt})`);
                        return {
                            rawContent: deepseekResponse.trim(),
                            hashtags: generateHashtagsForPlatform(platform, keyword),
                            cta: '',
                            formato: platform
                        };
                    }
                } else {
                    throw new Error('RESPUESTA_INSUFICIENTE');
                }
            } catch (deepseekError) {
                console.log(`[API-${requestId}] ❌ Error en Deepseek para ${platform} (intento ${attempt}/${maxAttempts}): ${deepseekError.message}`);
                
                // Si es el último intento o un error no relacionado con timeout, procesar error
                if (attempt === maxAttempts || !deepseekError.message.includes('aborted')) {
                    // Diagnosticar el error específico
                    const errorDiagnosis = diagnoseDeepseekError(deepseekError, DEEPSEEK_API_KEY);
                    console.log(`[API-${requestId}] 🔍 Diagnóstico final: ${errorDiagnosis.type} - ${errorDiagnosis.technicalMessage}`);
                    
                    // Si es un error crítico que no permite usar templates, lanzar error
                    if (!errorDiagnosis.canUseTemplates) {
                        throw new functions.https.HttpsError('failed-precondition', 
                            `❌ ${errorDiagnosis.userMessage}: ${errorDiagnosis.technicalMessage}`);
                    }
                    
                    // Solo usar fallback para errores que lo permiten, pero informar al usuario
                    console.log(`[API-${requestId}] ⚠️ Usando contenido de respaldo por: ${errorDiagnosis.userMessage} (después de ${maxAttempts} intentos)`);
                    
                    const fallbackContent = getExamplesForNetwork(platform, keyword, userContext);
                    const fallbackHashtags = generateHashtagsForPlatform(platform, keyword);
                    const fallbackVisual = generateVisualFormatForPlatform(platform, keyword);
                    
                    // Marcar que se usó fallback e incluir el motivo
                    return { 
                        rawContent: `⚠️ GENERADO CON TEMPLATES (${errorDiagnosis.userMessage} tras ${maxAttempts} intentos)\n\n${fallbackContent}`,
                        hashtags: fallbackHashtags,
                        cta: '',
                        formatoVisual: fallbackVisual,
                        formato: platform,
                        isFallback: true,
                        errorType: errorDiagnosis.type,
                        errorMessage: errorDiagnosis.userMessage
                    };
                } else {
                    // Es un timeout y no es el último intento, reintentar
                    console.log(`[API-${requestId}] 🔄 Reintentando debido a timeout...`);
                    attempt++;
                    // Pequeño delay antes del reintento
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
    } else {
        // DeepSeek no está disponible - verificar por qué
        const errorDiagnosis = diagnoseDeepseekError(new Error('API Key no configurada'), DEEPSEEK_API_KEY);
        console.log(`[API-${requestId}] ⚠️ DeepSeek no disponible: ${errorDiagnosis.technicalMessage}`);
        
        // Si es un error crítico, informar al usuario
        if (!errorDiagnosis.canUseTemplates) {
            throw new functions.https.HttpsError('failed-precondition', 
                `❌ ${errorDiagnosis.userMessage}: ${errorDiagnosis.technicalMessage}`);
        }
        
        // Usar templates pero informar claramente por qué
        console.log(`[API-${requestId}] 🔄 Usando contenido de respaldo para ${platform}`);
        const fallbackContent = getExamplesForNetwork(platform, keyword, userContext);
        const fallbackHashtags = generateHashtagsForPlatform(platform, keyword);
        const fallbackVisual = generateVisualFormatForPlatform(platform, keyword);
        
        return { 
            rawContent: `⚠️ GENERADO CON TEMPLATES (${errorDiagnosis.userMessage})\n\n${fallbackContent}`,
            hashtags: fallbackHashtags,
            cta: '',
            formatoVisual: fallbackVisual,
            formato: platform,
            isFallback: true,
            errorType: errorDiagnosis.type,
            errorMessage: errorDiagnosis.userMessage
        };
    }
}
