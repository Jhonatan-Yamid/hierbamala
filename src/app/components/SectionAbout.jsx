import {
  FaCocktail
} from "react-icons/fa";
export default function SectionAbout() {
  return (
    <div className="text-center text-slate-300 text-xl" id="about">
      <StepIcon icon={<FaCocktail />} number="2" title="Service details" />
      <h2 className=" text-slate-200 font-bold text-3xl pb-5">Sobre nosotros</h2>
      <p className="pb-2">
       Somos un Gastrobar cuya unica mision es contarte una historia en cada ´ñatp
      </p>
      <p>
        Resaltando siemnpre lo mejor de los priductos locales siempres frescos hasta tu mesa
      </p>
    </div>
  );
}
function StepIcon({ icon, number, title }) {
  return (
    <div className="flex flex-col items-center flex-wrap">
      <div className="flex items-center justify-center text-white mb-6 text-5xl">
        {icon}
      </div>
    </div>
  );
}