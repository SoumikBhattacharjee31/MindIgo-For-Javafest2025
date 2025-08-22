import { Gamepad2 } from "lucide-react";

const Games = () => {
    return (
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Games Section
                </h2>
                <p className="text-gray-600 mb-6">
                    This section is ready for customization. Add your specific games tracking components here.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                    <h4 className="font-medium text-gray-900 mb-2">Customization Space</h4>
                    <p className="text-sm text-gray-600">
                        Implement charts, forms, progress trackers, or any other components specific to games monitoring.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Games;