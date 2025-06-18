import React from 'react';

function Map() {
  return (
    <div className="w-full py-10">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15867.355916372471!2d-75.3630934!3d6.1523144!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e469f3f6617e7e7%3A0xa55e0ad52f372e32!2sHierba%20Mala%20Gastrobar!5e0!3m2!1ses!2sco!4v1716253768750!5m2!1ses!2sco" 
        width="100%" 
        height="450" 
        style={{ border: 0 }} 
        allowFullScreen="" 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa de Hierba Mala Gastrobar"
      ></iframe>
    </div>
  );
}

export default Map;
