import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function BackButton({
    label = "",
    className = "",
}) {

    const navigate = useNavigate();

    return (

        <button
            onClick={() => navigate(-1)}
            className={`
                flex items-center gap-2
                px-3.5 py-2
                rounded-lg
                border border-gray-200
                bg-white
                text-gray-700
                hover:bg-gray-100
                hover:text-black
                transition-all duration-200
                ${className}
            `}
        >

            <FaArrowLeft size={13} />

            {/* <span className="text-sm font-medium">
                {label}
            </span> */}

        </button>
    );
}