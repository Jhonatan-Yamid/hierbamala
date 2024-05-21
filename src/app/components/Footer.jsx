import Image from "next/image";

export default function Footer() {
  return (
    <div className=" bg-zinc-950 flex flex-row text-white justify-around items-center text-sm font-light flex-wrap footer py-5">
      <div>
        <Image
          src="/logo-white.png"
          alt="Logo"
          width={120}
          height={120}
          className="mr-3"
        />
      </div>
      <div>
        <ul className="flex flex-col">
          <a href="/">Home</a>
          <a href="#about">Nosotros</a>
          <a href="#services">Menú</a>
        </ul>
      </div>
      <div>
        <ul>
          <li className="font-bold">Contactanos</li>
          <li>hierbamala.gastrobar@gmail.com</li>
          <li>+57 (324) 640-5015</li>
          <a href="https://www.instagram.com/hierbamala.gastrobar/">
            @hierbamala.gastrobar
          </a>
        </ul>
      </div>
      <div>
        <a
          href="#book"
          className="font-bold text-white px-3 py-1 rounded border-white text-sm border-2"
        >
          Nuestro menú
        </a>
      </div>
    </div>
  );
}
