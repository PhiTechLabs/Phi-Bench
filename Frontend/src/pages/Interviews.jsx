    import React from "react";

    const Interviews = () => {
    return (
        <div className="p-6 bg-gray-100 min-h-screen">

        <div className="bg-white rounded-xl shadow-sm p-6">

            <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
                Interviews
            </h1>

            <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm shadow-md">
                + Schedule Interview
            </button>
            </div>

            <p className="text-sm text-gray-500">
            No interviews scheduled yet
            </p>

        </div>
        </div>
    );
    };

    export default Interviews;
