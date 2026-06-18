import React from "react";
import { FaLock, FaUserShield } from "react-icons/fa";

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-6 w-[80%] max-w-md h-120 max-h-[80%] text-center">
                
                {/* Icon */}
                <div className="w-18 h-18 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <FaLock className="text-red-600 text-4xl" />
                </div>

                {/* Heading */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Access Not Available
                </h1>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6">
                    You have successfully logged in, but
                    No permissions have been assigned to your account.
                    <br />
                    Because of this, you currently do not have access to any
                    modules or data within the portal.
                </p>

                {/* Information Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 w-[85%] ml-8">
                    <div className="flex flex-col items-center">
                        <FaUserShield className="text-blue-600 text-2xl mb-2" />

                        <p className="text-blue-800 font-medium">
                            Please contact your Super Admin or System
                            Administrator to assign the required permissions to your account.
                        </p>
                    </div>
                </div>

                {/* Error Code */}
                <div className="text-sm text-gray-400">
                    Error Code: <span className="font-medium">403</span> • No
                    Permissions Assigned
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;