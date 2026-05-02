import React from 'react';

function Map() {
  return (
    <div className="w-full py-10">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.8544801844864!2d-75.36307889599945!3d6.150236982231521!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e469f3f6617e7e7%3A0xa55e0ad52f372e32!2sHierba%20Mala%20Gastrobar!5e0!3m2!1ses!2sco!4v1777760642066!5m2!1ses!2sco" 
        width="100%" 
        height="450" 
        style={{ border: 0 }} 
        allowFullScreen="" 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa de Raices Campesinas Gastrobar"
      ></iframe>
    </div>
  );
}

export default Map;
