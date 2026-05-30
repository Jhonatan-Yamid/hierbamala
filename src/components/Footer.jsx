import Image from "next/image";

export default function Footer() {
  return (
    <div className=" bg-zinc-950 flex flex-row text-white justify-around items-center text-sm font-light flex-wrap footer py-5">
      <div>
        <Image
          src={process.env.NEXT_PUBLIC_WHITE_LOGO}
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
          <li>{process.env.NEXT_PUBLIC_EMAIL}</li>
          <li>+57 (321) 828-0162</li>
        </ul>
      </div>
      <div>
        <h1>Domicilio Gratis</h1>
      </div>
    </div>
  );
}
