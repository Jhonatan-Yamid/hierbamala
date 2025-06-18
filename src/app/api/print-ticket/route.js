import { NextResponse } from 'next/server';
import escpos from 'escpos';
import { promisify } from 'util';

// Configura escpos para usar USB
const escposUSB = require('escpos-usb');
escpos.USB = escposUSB;

export async function POST(request) {
  try {
    // Parsear body
    const { products, total } = await request.json();

    // Configurar impresora
    const device = new escpos.USB();
    const openDevice = promisify(device.open).bind(device);

    await openDevice(); // Espera a que el dispositivo se abra

    const printer = new escpos.Printer(device);

    // Imprimir
    printer
      .align('CT')
      .style('B')
      .size(1, 1)
      .text('Hierba Mala Gastrobar')
      .text('--------------------------')
      .align('LT');

    products.forEach((p) => {
      printer.text(`${p.name} x${p.quantity}  $${p.price * p.quantity}`);
      if (p.observation) {
        printer.text(`Obs: ${p.observation}`);
      }
      if (Array.isArray(p.additions) && p.additions.length > 0) {
        p.additions.forEach((a) => {
          printer.text(`+ ${a.name}  $${a.price}`);
        });
      }
    });

    printer
      .text('--------------------------')
      .align('RT')
      .text(`TOTAL: $${total}`)
      .cut()
      .close();

    return NextResponse.json({ message: 'Ticket impreso correctamente' }, { status: 200 });

  } catch (error) {
    console.error('Error al imprimir:', error);
    return NextResponse.json({ message: error.message || 'Error inesperado' }, { status: 500 });
  }
}
