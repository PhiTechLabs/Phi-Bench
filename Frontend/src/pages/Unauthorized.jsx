import React from "react";
import { FaLock, FaUserShield } from "react-icons/fa";

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8 w-full max-w-lg text-center">
                
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <FaLock className="text-red-600 text-4xl" />
                </div>

                {/* Heading */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Access Not Available
                </h1>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-8">
                    You have successfully logged in, but
                    No permissions have been assigned to your account.
                    <br />
                    Because of this, you currently do not have access to any
                    modules or data within the portal.
                </p>

                {/* Information Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
                    <div className="flex flex-col items-center">
                        <FaUserShield className="text-blue-600 text-2xl mb-3" />

                        <p className="text-blue-800 font-medium">
                            Please contact your Super Admin or System
                            Administrator to assign the required permissions and
                            data scope to your account.
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