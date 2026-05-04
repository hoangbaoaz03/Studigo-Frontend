import React from 'react';

const BusinessLogoStrip: React.FC = () => {
    const logos = [
        "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Lenovo_Global_Corporate_Logo.png/1200px-Lenovo_Global_Corporate_Logo.png",
        "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/1200px-Volkswagen_logo_2019.svg.png"
    ];

    return (
        <section className="py-8 bg-gray-50 border-t border-gray-200">
             <div className="container mx-auto px-6">
                <p className="text-center text-gray-600 font-bold mb-6">
                    Top companies choose <span className="text-purple-600">Studigo Business</span> to build in-demand career skills.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all">
                    {logos.map((logo, index) => (
                        <div key={index} className="h-8 w-24 md:h-10 md:w-32 relative">
                             <img src={logo} alt="Partner Logo" className="w-full h-full object-contain" />
                        </div>
                    ))}
                </div>
             </div>
        </section>
    );
};

export default BusinessLogoStrip;
