import { ImapFlow } from 'imapflow';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const client = new ImapFlow({
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        auth: {
            user: 'yamidjhonatan@gmail.com',
            pass: 'utkqyeuvtzpessuy'
        },
        logger: false
    });

    try {
        await client.connect();
        let lock = await client.getMailboxLock('INBOX');

        // 1. Filtramos desde la búsqueda por remitente Y que el asunto contenga "Transferencia" o "Recibo"
        // Esto reduce la cantidad de correos basura que descargamos
        let messages = await client.search({
            header: { from: 'alertasynotificaciones@an.notificacionesbancolombia.com' },
            body: 'Transferencia'
        });

        // Invertimos para tener los más recientes primero
        const allIds = messages.reverse();
        const resultados = [];

        for (const uid of allIds) {
            // Si ya encontramos 3 transferencias reales, paramos el bucle
            if (resultados.length >= 3) break;

            let message = await client.fetchOne(uid, { source: true, envelope: true });
            const body = message.source.toString();
            const subject = message.envelope.subject || "";

            // 2. Doble validación: Solo procesar si el cuerpo o asunto indican una transferencia recibida
            // Evitamos correos de "Inicio de sesión", "Compra", etc.
            if (!body.includes("transferencia") && !subject.includes("Transferencia")) {
                continue;
            }

            const montoMatch = body.match(/\$[\d,.]+/);
            // 1. Intentamos el formato de Wendy: $Monto de NOMBRE en...
            let nombreMatch = body.match(/\$[\d,.]+\s+de\s+([A-Z\s]{3,100}?)\s+en/i);

            // 2. Si no funciona, intentamos el formato estándar: transferencia de NOMBRE...
            if (!nombreMatch) {
                nombreMatch = body.match(/(?:pago de|transferencia de)\s+([A-Z\s]{3,100}?)(?:\s+por|\s+desde|\s+en|$)/i);
            }

            // 3. Limpieza final para evitar que capture palabras como "FAVOR" o "CAJERO"
            let quienFinal = 'Desconocido';
            if (nombreMatch) {
                const posibleNombre = nombreMatch[1].trim();
                // Si lo que capturó es una palabra de sistema, lo marcamos como desconocido
                const palabrasProhibidas = ["FAVOR", "NOTIFICACIONES", "BANCOLOMBIA"];
                if (!palabrasProhibidas.some(p => posibleNombre.toUpperCase().includes(p))) {
                    quienFinal = posibleNombre;
                }
            }

            const fechaHoraMatch = body.match(/(\d{2}\/\d{2}\/\d{4}) a las (\d{2}:\d{2})/);

            // Solo agregamos si al menos encontramos un monto (para descartar informativos vacíos)
            if (montoMatch) {
                resultados.push({
                    sujeto: subject,
                    monto: montoMatch[0],
                    quien: nombreMatch ? nombreMatch[1].trim() : 'Desconocido',
                    fecha: fechaHoraMatch ? `${fechaHoraMatch[1]} ${fechaHoraMatch[2]}` : 'Sin fecha',
                    id_interno: uid
                });
            }
        }

        lock.release();
        await client.logout();

        return NextResponse.json({
            success: true,
            data: resultados
        });

    } catch (error) {
        console.error('Error en IMAP:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}