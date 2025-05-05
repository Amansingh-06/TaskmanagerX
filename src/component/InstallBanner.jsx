import React from 'react';

const InstallPrompt = ({ onInstallClick, handleCancelClick }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-11/12 sm:w-96 flex flex-col items-center space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800">
                    Install this app on your device?
                </h3>
                <p className="text-gray-600 text-center text-sm">
                    Enjoy the app with full functionality by installing it on your device. You can always uninstall it later.
                </p>

                <div className="flex space-x-4">
                    <button
                        onClick={onInstallClick} // Trigger install when button clicked
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 focus:outline-none transition transform hover:scale-105 cursor-pointer"
                    >
                        Install
                    </button>
                    <button
                        onClick={handleCancelClick} // Trigger cancel action
                        className="bg-gray-400 text-white px-6 py-3 rounded-xl shadow-md hover:bg-gray-500 focus:outline-none transition transform hover:scale-105 cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
