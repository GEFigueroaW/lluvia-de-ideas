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

// FUNCIÓN PARA GENERAR EJEMPLOS ESPECÍFICOS POR RED SOCIAL Y TIPO DE COPY
function getExamplesForNetwork(networkName, keyword, userContext) {
    // Extraer el tipo de copy del userContext
    const copyType = userContext ? userContext.toLowerCase() : '';
    const isPositioning = copyType.includes('posicionamiento') || copyType.includes('branding');
    const isUrgency = copyType.includes('urgencia') || copyType.includes('escasez');
    const isDirectSale = copyType.includes('venta directa') || copyType.includes('persuasivo');
    
    switch(networkName) {
        case 'Facebook':
            if (isPositioning) {
                return `💭 La primera vez que descubrí ${keyword}, no sabía que se convertiría en mi filosofía de vida. 🌟 No se trata solo de una técnica o método... es una nueva forma de ver las posibilidades. 💫 Durante años creí que había límites en lo que podía lograr, hasta que ${keyword} me mostró que esos límites estaban solo en mi mente. 🔮 Ahora entiendo que no se trata de ser perfecto, sino de ser auténtico con quien realmente soy. ✨ Mi marca personal se ha transformado porque finalmente encontré mi verdadera voz. 👇 ¿Quién más ha sentido esa conexión profunda con algo que cambió su perspectiva? 💕`;
            }
            if (isUrgency) {
                return `🚨 ATENCIÓN: Solo hasta mañana puedes acceder a lo que cambió mi vida con ${keyword}. ⏰ Han pasado 6 meses desde que cerré esta oportunidad y las 47 personas que lo tomaron siguen agradeciéndomelo. 💥 No volveré a abrir esto hasta 2026 porque requiere mi atención personal completa. 🔥 Si has estado esperando la señal perfecta... ESTA ES. ⚡ Mañana a medianoche se cierra para siempre. 👆 Solo comenta "YA" si estás listo para el cambio más importante de tu vida. ⏳`;
            }
            if (isDirectSale) {
                return `💰 RESULTADOS REALES: ${keyword} me generó $12,847 en 45 días. 📊 No es casualidad, es método. Tampoco es suerte, es estrategia probada. 🎯 Mientras otros pierden tiempo con teorías, yo aplico lo que FUNCIONA. 💎 3 pilares que cambiarán tu cuenta bancaria: ✅ Sistema probado paso a paso ✅ Sin inversión inicial requerida ✅ Resultados visibles en 2 semanas 🔥 ¿Prefieres seguir soñando o empezar a ganar? 💸 Responde "QUIERO" y te muestro exactamente cómo. 🚀`;
            }
            return `💭 La primera vez que probé ${keyword}, pensé que era una pérdida de tiempo. Hoy, 6 meses después, no reconozco a la persona que era antes. 🌟 Mi familia me pregunta qué cambió en mí... La respuesta los sorprendería. 💫`;
            
        case 'LinkedIn':
            if (isPositioning) {
                return `🎯 REFLEXIÓN PROFESIONAL: ${keyword} redefinió mi liderazgo empresarial. 📈 En 15 años de carrera corporativa, nunca había visto una metodología que transforme tanto la cultura organizacional como el mindset individual. 💡 Lo que comenzó como una estrategia de optimización se convirtió en la base de nuestra propuesta de valor. 🏆 Nuestro equipo pasó de ejecutar tareas a liderar innovación. La diferencia: dejamos de enfocarnos en procesos y nos centramos en propósito. ⚡ El ROI más importante no está en las métricas, sino en la motivación intrínseca de cada colaborador. 💼 ¿Cómo están redefiniendo ustedes el liderazgo en sus organizaciones? #Liderazgo #TransformacionEmpresarial #CulturaOrganizacional`;
            }
            if (isUrgency) {
                return `⚠️ ALERTA PROFESIONAL: La ventana para dominar ${keyword} se cierra en Q1 2025. 📊 Datos de McKinsey confirman: empresas que lo adopten ahora tendrán 340% más ventaja competitiva. ⏰ Solo 90 días para posicionarse antes de que se sature el mercado. 🎯 Los early adopters ya están capturando el 80% de las oportunidades emergentes. 💼 Como consultor estratégico, veo la misma historia repetirse: quienes actúan rápido dominan, quienes dudan se quedan atrás. 🚀 ¿Su empresa está preparada para liderar o seguir? #EstrategiaEmpresarial #Innovacion #VentajaCompetitiva #Liderazgo`;
            }
            if (isDirectSale) {
                return `💎 ROI COMPROBADO: ${keyword} incrementó nuestros ingresos 280% en 8 meses. 📈 No es teoría, son números auditados. No es suerte, es metodología sistemática aplicada. 🎯 Resultados específicos que conseguimos: ✅ +$2.4M en nuevos contratos ✅ 89% retención de clientes ✅ 340% mejora en conversiones 💼 Si buscan crecimiento real y medible, necesitamos conversar. 🤝 Comparto la estrategia exacta con 5 empresas serias este mes. ¿Su organización califica? Escriban "ESTRATEGIA" en comentarios. 🚀 #Resultados #ROI #CrecimientoEmpresarial #EstrategiaComercial`;
            }
            return `📊 REVELACIÓN: Después de analizar 500+ casos de implementación de ${keyword}, descubrí un patrón que contradice todo lo que creíamos sobre productividad profesional. 💡 Las empresas que lo aplicaron vieron 280% más retención de talento.`;
            
        case 'X / Twitter':
            if (isPositioning) {
                return `🧠 MINDSET SHIFT: ${keyword} no es una habilidad, es una identidad. 💭 Dejé de preguntar "¿Cómo hago esto?" y empecé a preguntar "¿Quién necesito ser?" 🔥 El cambio fue instantáneo. La transformación, permanente. ⚡ Tu marca personal = Tu forma de pensar. 🎯 Cambia uno, cambias todo.`;
            }
            if (isUrgency) {
                return `🚨 BREAKING: ${keyword} se agota en 48h. 💥 Solo 12 spots disponibles. ⏰ Precio normal: $497. Precio ahora: $97. 🔥 Última vez que ofrezco esto a este precio. ⚡ Se cierra automáticamente cuando llegue a 0. 👆 Reply "GO" si lo quieres YA.`;
            }
            if (isDirectSale) {
                return `💰 ${keyword} = $47K en 60 días. 📊 Prueba: screenshot en mi bio. 🎯 Sistema exacto que uso: ✅ 20 min/día ✅ $0 inversión inicial ✅ Escalable infinitamente 🔥 ¿Quieres el blueprint? 💸 RT + reply "BLUEPRINT" 🚀`;
            }
            return `🔥 VERDAD INCÓMODA: ${keyword} no es lo que te vendieron. Es 10 veces más poderoso y 100 veces más simple. 💥 El 95% lo hace mal por esto...`;
            
        case 'WhatsApp':
            if (isPositioning) {
                return `🌟 Mi transformación con ${keyword} va más allá de resultados... cambió mi identidad. 💎 No se trata de técnicas, sino de convertirte en la versión más auténtica de ti mismo. ✨ Cuando alineas quién eres con lo que haces, la magia sucede naturalmente. 🔮 Tu presencia se vuelve magnética sin esfuerzo. 💫 ¿Estás listo para descubrir tu verdadero potencial? 🚀`;
            }
            if (isUrgency) {
                return `🚨 ÚLTIMO AVISO: Lo que descubrí sobre ${keyword} cambió mi vida en 21 días. 💥 Solo 3 personas más pueden acceder antes de que retire esta información permanentemente. 🔒 No exagero: va contra todo lo establecido. ⚡ ¿Eres una de esas 3 personas? 👆 Responde YA 🏃‍♀️`;
            }
            if (isDirectSale) {
                return `💰 OFERTA DIRECTA: ${keyword} me está generando $8K/mes. 📊 Te enseño el sistema exacto por $297 (valor real $1,997). 🎯 Incluye: ✅ Estrategia paso a paso ✅ Templates que uso ✅ Soporte directo conmigo 🔥 Solo para 10 personas serias. ✅ Responde "QUIERO" si estás dentro 💸`;
            }
            return `🚨 ÚLTIMO AVISO: Lo que descubrí sobre ${keyword} cambió mi vida en 21 días. 💥 Solo 3 personas más pueden acceder a esta información antes de que la retire permanentemente.`;
            
        case 'Instagram':
            if (isPositioning) {
                return `✨ GLOW UP MINDSET: ${keyword} no cambió solo mi apariencia... transformó mi energía completa. 💫 Antes: Insegura, buscando validación externa 🌟 Ahora: Confident, irradiando autenticidad 💎 La diferencia no está en lo que hago, sino en quién me permito ser. 🔥 When you align with your true self, everything shifts ✋ 💕 Tu vibe atrae tu tribe, baby 👑 #SelfLove #Authenticity #GlowUp #Mindset #SelfGrowth #Confidence #Energy #Transformation`;
            }
            if (isUrgency) {
                return `🚨 GIRLS! Solo 24h para que cierren ${keyword} para siempre 😭 💔 NO puedo creer que lo vayan a quitar de la app... ⏰ Literalmente changed my life y ahora solo quedan horas 💥 Si lo has estado considerando, THIS IS IT sis 🔥 After tomorrow = gone forever 😩 ✨ Swipe para ver my transformation 👆 Stories para el link directo ⚡ #LastChance #TransformationTuesday #DontMissOut #LinkInBio`;
            }
            if (isDirectSale) {
                return `💰 REAL TALK: ${keyword} me está dando $15K/month 📊 Not flexing, just facts babe 💯 Si estás ready para tu financial glow up: ✅ Sistema que uso (super simple) ✅ Templates exactos ✅ Support grupo exclusivo 🔥 Solo para 20 boss babes serias 💎 Investment: $497 (payment plan available) 💕 DM "READY" si you're serious about leveling up 👑 #BossBabe #FinancialFreedom #MoneyMindset #WealthBuilding #Success`;
            }
            return `✨ ANTES: Escéptica total sobre ${keyword} 😒 DESPUÉS: Completamente transformada 💫 Lo que NO esperaba: Que cambiaría mi relación con todo lo demás. 🌟`;
            
        case 'TikTok':
            if (isPositioning) {
                return `POV: Descubres que ${keyword} no es un hack... es tu nueva identidad 💫 *aesthetic transformation* When you stop trying to be someone else and embrace who you actually are 🔥 The confidence hits different ✨ #MainCharacterEnergy #SelfGrowth #AuthenticSelf #IdentityShift #PersonalBrand #Confidence #SelfLove`;
            }
            if (isUrgency) {
                return `GUYS THIS IS NOT A DRILL ‼️ ${keyword} disappears in 2 days 😭 I'm literally shaking... this changed my ENTIRE life 💔 If you've been waiting for a sign THIS IS IT ⚡ After Wednesday = gone forever 🚨 Link in bio RUN don't walk 🏃‍♀️ #Emergency #LastChance #LifeChanging #RunDontWalk #LinkInBio`;
            }
            if (isDirectSale) {
                return `I made $23K in 30 days with ${keyword} 💰 Proof in my bio ✨ Here's exactly what I did: ✅ This one strategy ✅ Zero followers needed ✅ Works from your phone 🔥 Teaching 50 people max 💯 $297 gets you everything ⚡ Comment "BAG" if you're ready to secure yours 💸 #MoneyTok #SideHustle #OnlineIncome #FinancialFreedom`;
            }
            return `POV: Intentas ${keyword} por primera vez esperando resultados "normales"... 👀 Pero esto pasó 🤯 *mind blown* Me quedé así toda la semana 😱`;
            
        case 'Telegram':
            if (isPositioning) {
                return `🎯 ANÁLISIS ESTRATÉGICO: ${keyword} como ventaja competitiva sostenible 📊 Implementación exitosa requiere: • Mindset de innovador temprano • Visión a largo plazo (24-36 meses) • Tolerancia a la experimentación 💡 No es una táctica, es una filosofía operacional que redefine la propuesta de valor. 🏆 Organizaciones que lo han adoptado reportan: • Mayor coherencia en decision-making • Cultura de innovación más robusta • Posicionamiento de liderazgo en su sector 📈 ¿Tu organización está lista para liderar la siguiente ola de innovación?`;
            }
            if (isUrgency) {
                return `⚠️ ALERTA CRÍTICA: ${keyword} se descontinúa en 72 horas 📉 Supply chain disruption global afecta disponibilidad hasta 2026 ⏰ Únicamente 127 unidades restantes en inventario mundial 🚨 Empresas Fortune 500 ya compraron stock para 3 años 💼 Precio aumenta 340% después del deadline 📊 Ventana de oportunidad se cierra: Jueves 23:59 GMT ⚡ Decisión estratégica requerida NOW`;
            }
            if (isDirectSale) {
                return `💎 PROPUESTA DIRECTA: ${keyword} generó $847K en revenue adicional ⚡ ROI documentado: 423% en 180 días 📊 Sistema replicable que incluye: • Metodología completa paso a paso • Software propietario (licencia perpetua) • Consultoría estratégica 1:1 por 90 días 🎯 Inversión: $4,997 (valor real $24,997) 🤝 Solo para 15 organizaciones serias este trimestre 📈 Payment plan available. Reply "PROPOSAL" para detalles completos`;
            }
            return `📈 ANÁLISIS EXCLUSIVO: ${keyword} en 2024 🔹 Adopción: +340% en últimos 6 meses 📊 ROI promedio: 2.8x en 30-60 días ⚡ Tasa de éxito: 89% con implementación correcta`;
            
        case 'Reddit':
            if (isPositioning) {
                return `The Philosophy Behind ${keyword} - Why It's More Than Just a Tool [Discussion] 🧠 After 2 years of deep implementation, I realized this isn't about optimization - it's about identity reconstruction. 💭 Traditional approaches treat it like a skill to acquire. Reality: it's a worldview to embody. 📚 The real transformation happens when you stop asking "How do I do this?" and start asking "Who do I need to become?" 🔄 Changed my entire relationship with success, failure, and progress. Would love to hear your philosophical takes on this. What's your experience with identity-level changes? 🤔`;
            }
            if (isUrgency) {
                return `PSA: ${keyword} program shutting down permanently in 48 hours ⚠️ Not clickbait - confirmed by multiple sources in r/entrepreneur and r/digitalnomad 📰 Creator announced retirement due to personal reasons 😢 All materials, community access, and future updates gone forever after deadline ⏰ Current members trying to archive everything but legal restrictions apply 📋 If you've been on the fence, this is literally the last chance ever 🚨 No refunds, no extensions, no exceptions 💔 Link still works but payment processor cuts off Thursday midnight EST ⚡`;
            }
            if (isDirectSale) {
                return `${keyword} Income Report - $127K in 8 months [Data Inside] 💰 Full transparency: Started with $500, reinvested everything, scaled systematically 📊 Proof, expenses, taxes, everything documented in spreadsheet (link in comments) 🔍 What I'm selling: The exact playbook I used. Not a course, not coaching - just the step-by-step system 📋 $497 one-time payment. No upsells, no recurring anything. You get the files and you're done ✅ Only doing this for 50 people max because I want to maintain quality control 🎯 Questions welcome but please read the FAQ comment first 👇`;
            }
            return `Mi experiencia BRUTAL con ${keyword} - 18 meses después [LONG] 📝 TL;DR: Cambió mi vida, pero NO como esperaba. Backstory: Era escéptico total, lo intenté para probar que era BS... 💀`;
            
        case 'YouTube':
            if (isPositioning) {
                return `🎥 The REAL Story Behind ${keyword} - Building Your Personal Brand (Not Clickbait) 🎯 ✅ Why most people get this completely wrong ✅ The identity shift that changes everything ✅ How to build authentic influence (not fake guru stuff) ✅ My 3-year journey from unknown to thought leader ⚡ This isn't about tactics - it's about becoming the person who naturally attracts opportunities 🌟 Free resources and frameworks in description 📋 No course sales, no affiliate links - just pure value 💎`;
            }
            if (isUrgency) {
                return `🚨 BREAKING: ${keyword} Platform Shutting Down This Week! 😱 ⚠️ Official announcement dropped 2 hours ago ⚠️ ⏰ All accounts deactivated Friday at midnight PST 📱 Millions of users scrambling to backup their data 💾 Legal battle brewing but damage already done 📰 ✅ How to save your progress before it's too late ✅ Alternative platforms that might work ✅ What this means for the industry 🔥 URGENT: Watch before Friday or lose everything! ⚡ Emergency backup tutorial in pinned comment 👇`;
            }
            if (isDirectSale) {
                return `💰 How I Made $89K With ${keyword} (Showing Real Numbers) 🎯 📊 Full income breakdown + expenses (nothing hidden) 💻 Exact tools, software, and systems I use ⚡ Why 90% of people fail (and how to be in the 10%) 📋 Complete step-by-step blueprint in description 🔥 $297 for everything - no upsells, no BS, just results 💎 100+ success stories from students (testimonials in comments) ✅ 30-day money-back guarantee if you follow the system 🚀 Link below but only taking 100 students this month 👇`;
            }
            return `📺 ${keyword.toUpperCase()} desde CERO - Lo que NADIE te cuenta 🎯 ✅ Guía completa: 0 a experto en 30 días ⚠️ Errores que me costaron 6 meses (para que tú no los cometas)`;
            
        default:
            return `💡 ${keyword} cambió mi perspectiva sobre todo. 🤔 Lo que descubrí desafía lo que todos "sabemos" sobre este tema. 🔥`;
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
    
    const apiCall = axios.post(`${DEEPSEEK_ENDPOINTS[0]}/chat/completions`, {
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
    
    return Promise.race([apiCall, timeoutPromise]);
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

            // Generar ideas usando fallback por ahora (para garantizar funcionamiento)
            const ideas = {};
            platforms.forEach(platform => {
                ideas[platform] = getExamplesForNetwork(platform, keyword, userContext);
            });

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
