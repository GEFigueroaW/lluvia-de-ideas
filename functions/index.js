const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Cargar variables de entorno de forma segura
require('dotenv').config();

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
const DEEPSEEK_API_KEY = envKey || configValue;
const DEEPSEEK_ENDPOINTS = [
    'https://api.deepseek.com/v1'
];

console.log('[DEBUG] Final DEEPSEEK_API_KEY:', DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.substring(0, 8) + '...' : 'NOT_SET');

// Validar que tenemos la API key
if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_KEY.startsWith('sk-')) {
    console.warn('⚠️ DEEPSEEK_API_KEY no configurada correctamente. Usando solo templates fallback.');
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

FORMATO ESPECÍFICO REQUERIDO PARA ${platform}:
${getFormatSpecsForPlatform(platform)}

INSTRUCCIONES CRÍTICAS:
1. Crea contenido ÚNICO y ORIGINAL sobre "${keyword}" (NO uses frases genéricas como "6 meses después" o "500+ casos")
2. Aplica la estrategia de ${copyStrategy.split(' - ')[0]} de manera auténtica
3. Sigue EXACTAMENTE el formato específico de ${platform}
4. Incluye emojis relevantes pero no excesivos
5. Genera un gancho impactante en las primeras palabras
6. INCLUYE hashtags relevantes para ${platform}
7. Asegúrate que sea copy-paste ready para publicar
8. VARÍA los números, timeframes y ejemplos - sé creativo y específico

RESPUESTA EN FORMATO JSON:
{
  "contenido": "El copy principal optimizado para ${platform}",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "cta": "Call to action específico",
  "formato": "${platform}"
}

El contenido debe ser completamente original y seguir el formato característico de ${platform}.`;
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

// FUNCIÓN PARA LLAMAR A DEEPSEEK API CON TIMEOUT Y RETRY
async function callDeepseekAPI(prompt) {
    console.log(`[DEEPSEEK] 🚀 Iniciando llamada...`);
    
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('TIMEOUT: Deepseek API tardó más de 25 segundos'));
        }, 25000);
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
                max_tokens: 3000,
                temperature: 0.7,
                top_p: 0.9,
                stream: false
            };
            
            console.log(`[DEEPSEEK] 📡 Enviando request...`);
            
            const response = await axios.post(`${DEEPSEEK_ENDPOINTS[0]}/chat/completions`, requestData, {
                headers: {
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Firebase-Functions/1.0'
                },
                timeout: 20000,
                validateStatus: (status) => status < 500 // Acepta 4xx pero rechaza 5xx
            });
            
            console.log(`[DEEPSEEK] ✅ Respuesta recibida:`, response.status);
            
            if (response.status === 429) {
                throw new Error('RATE_LIMIT: Too many requests');
            }
            
            if (response.status >= 400) {
                throw new Error(`API_ERROR: Status ${response.status} - ${JSON.stringify(response.data)}`);
            }
            
            if (response.data && response.data.choices && response.data.choices[0]) {
                const content = response.data.choices[0].message.content.trim();
                console.log(`[DEEPSEEK] ✅ Contenido generado: ${content.substring(0, 100)}...`);
                
                if (content.length < 30) {
                    throw new Error('CONTENT_TOO_SHORT: Respuesta de Deepseek muy corta');
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
                throw new Error('EMPTY_RESPONSE: Respuesta de Deepseek vacía o malformada');
            }
        } catch (axiosError) {
            console.error(`[DEEPSEEK] ❌ Error en API:`, axiosError.message);
            if (axiosError.response) {
                console.error(`[DEEPSEEK] ❌ Status:`, axiosError.response.status);
                console.error(`[DEEPSEEK] ❌ Headers:`, axiosError.response.headers);
                if (axiosError.response.data) {
                    console.error(`[DEEPSEEK] ❌ Data:`, JSON.stringify(axiosError.response.data).substring(0, 200));
                }
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
            
            // Verificar disponibilidad de Deepseek una sola vez
            const useDeepseek = DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.startsWith('sk-');
            console.log(`[API-${requestId}] 🔍 Deepseek disponible: ${useDeepseek ? 'SÍ' : 'NO'}`);
            
            for (const platform of platforms) {
                console.log(`[API-${requestId}] Generando contenido para ${platform} con tipo: ${userContext}`);
                
                if (useDeepseek) {
                    let attempt = 0;
                    let deepseekSuccess = false;
                    
                    while (attempt < 2 && !deepseekSuccess) {
                        attempt++;
                        try {
                            // Construir prompt específico para Deepseek
                            const prompt = buildPromptForPlatform(platform, keyword, userContext);
                            console.log(`[API-${requestId}] 🚀 Llamando a Deepseek API para ${platform} (intento ${attempt}/2)...`);
                            
                            // Llamar a Deepseek API con delay entre llamadas
                            if (attempt > 1) {
                                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo de delay
                            }
                            
                            const deepseekResponse = await callDeepseekAPI(prompt);
                            
                            if (deepseekResponse && (deepseekResponse.contenido || deepseekResponse.length > 50)) {
                                // Manejar respuesta estructurada de Deepseek
                                if (deepseekResponse.contenido) {
                                    // Respuesta JSON estructurada
                                    ideas[platform] = {
                                        rawContent: deepseekResponse.contenido,
                                        hashtags: deepseekResponse.hashtags || [],
                                        cta: deepseekResponse.cta || '',
                                        formato: platform
                                    };
                                    console.log(`[API-${requestId}] ✅ Deepseek JSON exitoso para ${platform} con ${deepseekResponse.hashtags?.length || 0} hashtags`);
                                } else {
                                    // Respuesta de texto plano (fallback)
                                    ideas[platform] = {
                                        rawContent: deepseekResponse.trim(),
                                        hashtags: [],
                                        cta: '',
                                        formato: platform
                                    };
                                    console.log(`[API-${requestId}] ✅ Deepseek texto exitoso para ${platform}`);
                                }
                                deepseekSuccess = true;
                            } else {
                                console.log(`[API-${requestId}] ⚠️ Respuesta de Deepseek insuficiente para ${platform} (intento ${attempt})`);
                            }
                        } catch (deepseekError) {
                            console.log(`[API-${requestId}] ❌ Error en Deepseek para ${platform} (intento ${attempt}): ${deepseekError.message}`);
                        }
                    }
                    
                    // Si Deepseek falló después de 2 intentos, usar fallback
                    if (!deepseekSuccess) {
                        console.log(`[API-${requestId}] 🔄 Usando fallback mejorado para ${platform} después de fallos en Deepseek`);
                        const fallbackContent = getExamplesForNetwork(platform, keyword, userContext);
                        const fallbackHashtags = generateHashtagsForPlatform(platform, keyword);
                        ideas[platform] = { 
                            rawContent: fallbackContent,
                            hashtags: fallbackHashtags,
                            cta: '',
                            formato: platform
                        };
                    }
                } else {
                    console.log(`[API-${requestId}] 🔄 Usando templates mejorados para ${platform} (Deepseek no disponible)`);
                    const fallbackContent = getExamplesForNetwork(platform, keyword, userContext);
                    const fallbackHashtags = generateHashtagsForPlatform(platform, keyword);
                    ideas[platform] = { 
                        rawContent: fallbackContent,
                        hashtags: fallbackHashtags,
                        cta: '',
                        formato: platform
                    };
                }
                
                // Pequeño delay entre plataformas para evitar rate limiting
                if (platforms.indexOf(platform) < platforms.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
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
