import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

export default function ConfirmDialog({
    msg,
    onConfirm,
    onCancel,
}) {

    return (

        <div className="fixed inset-0 bg-black/50 z-998 flex items-center justify-center">

            <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center">

                <div className="flex justify-center mb-3">

                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">

                        <FaExclamationTriangle className="text-red-500 text-xl" />

                    </div>

                </div>

                <h3 className="text-gray-800 font-semibold text-base mb-1">
                    Are you sure?
                </h3>

                <p className="text-gray-500 text-sm mb-5">
                    {msg}
                </p>

                <div className="flex gap-3 justify-center">

                    <button
                        onClick={onCancel}
                        className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>

    );

}