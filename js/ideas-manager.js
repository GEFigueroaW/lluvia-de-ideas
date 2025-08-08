// =========================================
// MÓDULO DE GESTIÓN DE IDEAS - ARCHIVO DEDICADO
// =========================================

import { db } from './firebase-config.js';
import { getCurrentUser } from './auth.js';
import { showNotification, handleError, formatDate, generateUniqueId } from './utils.js';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js';

// =========================================
// VARIABLES GLOBALES
// =========================================
let userIdeas = [];
let currentSession = null;

// =========================================
// FUNCIONES DE GUARDADO
// =========================================

/**
 * Guarda una sesión de ideas generadas en Firestore
 * @param {Array} ideas - Array de ideas generadas
 * @param {string} topic - Tema de las ideas
 * @param {string} context - Contexto proporcionado
 * @returns {Promise<string>} ID de la sesión guardada
 */
export async function saveIdeasSession(ideas, topic, context) {
    try {
        const user = getCurrentUser();
        if (!user) throw new Error('Usuario no autenticado');

        const sessionData = {
            userId: user.uid,
            userEmail: user.email,
            topic: topic,
            context: context || '',
            ideas: ideas,
            ideaCount: ideas.length,
            createdAt: new Date(),
            lastAccessed: new Date(),
            tags: extractTagsFromTopic(topic),
            sessionId: generateUniqueId(),
            version: '1.0'
        };

        const docRef = await addDoc(collection(db, 'ideas_sessions'), sessionData);
        
        showNotification('💾 Ideas guardadas exitosamente', 'success', 3000);
        
        // Actualizar estadísticas del usuario
        await updateUserStats(user.uid, ideas.length);
        
        return docRef.id;
        
    } catch (error) {
        handleError(error, 'al guardar ideas');
        return null;
    }
}

/**
 * Carga el historial de ideas del usuario
 * @param {number} limitCount - Número máximo de sesiones a cargar
 * @returns {Promise<Array>} Array de sesiones de ideas
 */
export async function loadUserIdeasHistory(limitCount = 20) {
    try {
        const user = getCurrentUser();
        if (!user) return [];

        const q = query(
            collection(db, 'ideas_sessions'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const ideas = [];

        querySnapshot.forEach((doc) => {
            ideas.push({
                id: doc.id,
                ...doc.data()
            });
        });

        userIdeas = ideas;
        return ideas;

    } catch (error) {
        handleError(error, 'al cargar historial de ideas');
        return [];
    }
}

/**
 * Obtiene una sesión específica de ideas
 * @param {string} sessionId - ID de la sesión
 * @returns {Promise<Object|null>} Datos de la sesión
 */
export async function getIdeasSession(sessionId) {
    try {
        const docRef = doc(db, 'ideas_sessions', sessionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Actualizar último acceso
            await updateDoc(docRef, {
                lastAccessed: new Date()
            });

            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        }

        return null;

    } catch (error) {
        handleError(error, 'al obtener sesión de ideas');
        return null;
    }
}

/**
 * Elimina una sesión de ideas
 * @param {string} sessionId - ID de la sesión a eliminar
 * @returns {Promise<boolean>} True si se eliminó exitosamente
 */
export async function deleteIdeasSession(sessionId) {
    try {
        await deleteDoc(doc(db, 'ideas_sessions', sessionId));
        showNotification('🗑️ Sesión eliminada correctamente', 'info', 2000);
        
        // Actualizar cache local
        userIdeas = userIdeas.filter(session => session.id !== sessionId);
        
        return true;

    } catch (error) {
        handleError(error, 'al eliminar sesión');
        return false;
    }
}

// =========================================
// FUNCIONES DE EXPORTACIÓN
// =========================================

/**
 * Exporta ideas a archivo JSON
 * @param {Object} session - Sesión de ideas a exportar
 */
export function exportIdeasToJSON(session) {
    try {
        const exportData = {
            topic: session.topic,
            context: session.context,
            ideas: session.ideas,
            generatedAt: session.createdAt,
            totalIdeas: session.ideaCount,
            exportedAt: new Date().toISOString(),
            exportFormat: 'JSON',
            version: '1.0'
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        downloadFile(jsonString, `ideas_${sanitizeFilename(session.topic)}.json`, 'application/json');
        
        showNotification('📄 Ideas exportadas a JSON', 'success', 2000);

    } catch (error) {
        handleError(error, 'al exportar a JSON');
    }
}

/**
 * Exporta ideas a archivo de texto
 * @param {Object} session - Sesión de ideas a exportar
 */
export function exportIdeasToTxt(session) {
    try {
        let textContent = `
📝 IDEAS GENERADAS - ${session.topic.toUpperCase()}
${'='.repeat(60)}

📅 Fecha: ${formatDate(session.createdAt)}
🎯 Tema: ${session.topic}
📝 Contexto: ${session.context || 'No especificado'}
📊 Total de ideas: ${session.ideaCount}

${'='.repeat(60)}
💡 IDEAS:
${'='.repeat(60)}

`;

        session.ideas.forEach((idea, index) => {
            const ideaTitle = idea.title || `Idea ${index + 1}`;
            const ideaDescription = idea.description || idea;
            
            textContent += `${index + 1}. ${ideaTitle}\n`;
            textContent += `   ${ideaDescription}\n\n`;
        });

        textContent += `
${'='.repeat(60)}
📊 RESUMEN:
${'='.repeat(60)}
• Total de ideas generadas: ${session.ideaCount}
• Exportado por: FeedFlow
• Fecha de exportación: ${formatDate(new Date())}

¡Gracias por usar FeedFlow! 🚀
`;

        downloadFile(textContent, `ideas_${sanitizeFilename(session.topic)}.txt`, 'text/plain');
        
        showNotification('📄 Ideas exportadas a TXT', 'success', 2000);

    } catch (error) {
        handleError(error, 'al exportar a TXT');
    }
}

/**
 * Exporta ideas a formato Markdown
 * @param {Object} session - Sesión de ideas a exportar
 */
export function exportIdeasToMarkdown(session) {
    try {
        let mdContent = `# 💡 Ideas para: ${session.topic}

---

## 📋 Información de la Sesión

- **📅 Fecha:** ${formatDate(session.createdAt)}
- **🎯 Tema:** ${session.topic}
- **📝 Contexto:** ${session.context || 'No especificado'}
- **📊 Total de ideas:** ${session.ideaCount}

---

## 🚀 Ideas Generadas

`;

        session.ideas.forEach((idea, index) => {
            const ideaTitle = idea.title || `Idea ${index + 1}`;
            const ideaDescription = idea.description || idea;
            
            mdContent += `### ${index + 1}. ${ideaTitle}\n\n`;
            mdContent += `${ideaDescription}\n\n`;
            mdContent += `---\n\n`;
        });

        mdContent += `
## 📊 Resumen

- **Total de ideas generadas:** ${session.ideaCount}
- **Generado con:** [FeedFlow](https://feedflow.app) 🚀
- **Fecha de exportación:** ${formatDate(new Date())}

> ¡Esperamos que estas ideas te inspiren a crear algo increíble! 💫
`;

        downloadFile(mdContent, `ideas_${sanitizeFilename(session.topic)}.md`, 'text/markdown');
        
        showNotification('📄 Ideas exportadas a Markdown', 'success', 2000);

    } catch (error) {
        handleError(error, 'al exportar a Markdown');
    }
}

// =========================================
// FUNCIONES DE UTILIDAD
// =========================================

/**
 * Descarga un archivo con el contenido especificado
 * @param {string} content - Contenido del archivo
 * @param {string} filename - Nombre del archivo
 * @param {string} mimeType - Tipo MIME del archivo
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

/**
 * Sanitiza un nombre de archivo
 * @param {string} filename - Nombre a sanitizar
 * @returns {string} Nombre sanitizado
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 50);
}

/**
 * Extrae tags de un tema
 * @param {string} topic - Tema del cual extraer tags
 * @returns {Array} Array de tags
 */
function extractTagsFromTopic(topic) {
    const commonWords = ['el', 'la', 'de', 'para', 'con', 'en', 'un', 'una', 'y', 'o'];
    
    return topic
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word))
        .slice(0, 5);
}

/**
 * Actualiza las estadísticas del usuario
 * @param {string} userId - ID del usuario
 * @param {number} ideasCount - Número de ideas generadas
 */
async function updateUserStats(userId, ideasCount) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const currentStats = userDoc.data();
            await updateDoc(userRef, {
                ideasGenerated: (currentStats.ideasGenerated || 0) + ideasCount,
                lastIdeaGenerated: new Date(),
                totalSessions: (currentStats.totalSessions || 0) + 1
            });
        }
    } catch (error) {
        console.error('Error updating user stats:', error);
    }
}

// =========================================
// FUNCIONES PÚBLICAS PARA EL DOM
// =========================================

/**
 * Obtiene el cache local de ideas del usuario
 * @returns {Array} Array de sesiones de ideas
 */
export function getCachedUserIdeas() {
    return userIdeas;
}

/**
 * Busca ideas por tema o contenido
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Ideas filtradas
 */
export function searchIdeas(searchTerm) {
    if (!searchTerm) return userIdeas;
    
    const term = searchTerm.toLowerCase();
    
    return userIdeas.filter(session => 
        session.topic.toLowerCase().includes(term) ||
        session.context.toLowerCase().includes(term) ||
        session.ideas.some(idea => 
            (idea.title && idea.title.toLowerCase().includes(term)) ||
            (idea.description && idea.description.toLowerCase().includes(term)) ||
            (typeof idea === 'string' && idea.toLowerCase().includes(term))
        )
    );
}
