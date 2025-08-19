interface FeatureCardProps {
    index: number
    icon: React.ElementType;
    title: string;
    description: string;
    gradient: string;
    iconBg: string;
    placeholderBg: string;
    placeholderText: string;
    placeholder: string;
    isVisible: boolean;
};
const FeatureCard: React.FC<FeatureCardProps> = ({
    index,
    icon,
    title,
    description,
    gradient,
    iconBg,
    placeholderBg,
    placeholderText,
    placeholder,
    isVisible
}) => {
    const IconComponent = icon;

    return (
        <div
            id={`feature-${index}`}
            data-animate
            className={`bg-gradient-to-br ${gradient} rounded-2xl p-8 hover:shadow-xl transition-all duration-700 transform ${isVisible
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-20 opacity-0 scale-95'
                } hover:-translate-y-1 hover:scale-105`}
            style={{
                transitionDelay: `${index * 150}ms`
            }}
        >
            {/* Icon with Animation */}
            <div className={`${iconBg} rounded-full p-3 w-fit mb-6 transform transition-all duration-500 ${isVisible ? 'rotate-0 scale-100' : 'rotate-12 scale-0'
                }`}
                style={{ transitionDelay: `${index * 150 + 200}ms` }}>
                <IconComponent className="h-8 w-8 text-white" />
            </div>

            {/* Content */}
            <h3 className={`text-2xl font-bold text-gray-900 mb-4 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150 + 300}ms` }}>
                {title}
            </h3>

            <p className={`text-gray-600 mb-6 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150 + 400}ms` }}>
                {description}
            </p>

            {/* Placeholder with Animation */}
            <div className={`${placeholderBg} rounded-lg h-32 flex items-center justify-center transform transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150 + 500}ms` }}>
                <span className={`${placeholderText} font-semibold`}>
                    {placeholder}
                </span>
            </div>
        </div>
    );
}

export default FeatureCard;