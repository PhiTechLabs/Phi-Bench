import React, { useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";

export default function Toast({ msg, type, onClose }) {

    useEffect(() => {

        const t = setTimeout(onClose, 3500);

        return () => clearTimeout(t);

    }, []);

    return (

        <div
            className={`fixed bottom-6 right-6 z-999 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-up
            ${type === "success"
                    ? "bg-green-600"
                    : "bg-red-500"
                }`}
        >

            {type === "success"
                ? <FaCheck />
                : <FaTimes />
            }

            <span>{msg}</span>

            <button
                onClick={onClose}
                className="ml-1 opacity-70 hover:opacity-100"
            >
                <RxCross2 />
            </button>

        </div>

    );

}