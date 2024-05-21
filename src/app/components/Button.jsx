import {useRouter} from 'next/navigation'
function Button(props) {
    const router = useRouter()
  return (
    <div>
      <button
        className="bg-green-500 text-white p-3 rounded-lg mb-4"
        onClick={() => router.push("/dashboard/ingredientsCreate")}
      >
        Create Item
      </button>
    </div>
  );
}

export default Button;
