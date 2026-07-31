import { useState } from 'react';

const faqData = [
    {
        question: 'What is a bench resource?',
        answer: "A bench resource is a consultant or employee on your roster who is currently available — not deployed on a client project — and ready to be matched to a new opening. PhiBench tracks their skills, availability, and status so you always know who's free to deploy.",
    },
    {
        question: 'How does PhiBench verify consultants?',
        answer: 'Every consultant profile is validated against submitted documents, skill assessments, and prior deployment history before being marked "verified" — so clients and account managers can trust the bench data they\'re looking at.',
    },
    {
        question: 'What industries do you support?',
        answer: 'PhiBench is built to adapt to any vertical — including IT, Healthcare & Life Sciences, Finance & Banking, Telecom, Retail & E-commerce, Manufacturing, Education, and Consulting — with workflows that flex to each industry\'s hiring and compliance needs.',
    },
    {
        question: 'How quickly can consultants be deployed?',
        answer: "Since verified availability and skills are tracked in real time, most consultants can be matched and proposed to a client within the same day — with final deployment speed depending on the client's own interview and onboarding process.",
    },
];

const PlusIcon = ({ open }) => (
    <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100">
        <span
            className="absolute h-[2px] w-2.5 bg-gray-700 transition-transform duration-300"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
        <span
            className="absolute h-2.5 w-[2px] bg-gray-700 transition-transform duration-300"
            style={{ transform: open ? 'rotate(90deg) scale(0)' : 'rotate(0deg) scale(1)' }}
        />
    </span>
);

export const LandingFAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (idx) => setOpenIndex((prev) => (prev === idx ? null : idx));

    return (
        <section id="faq" className="scroll-mt-16 min-h-[calc(100vh-4rem)] flex flex-col justify-center py-20 bg-white">

            <div className="text-center mb-16 px-4">
                <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
                <p className="mt-4 max-w-2xl mx-auto text-gray-500 text-sm">
                    Everything you need to know about scaling your team with Phibench resources.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-6 space-y-4">
                {faqData.map((item, idx) => {
                    const isOpen = openIndex === idx;

                    return (
                        <div
                            key={idx}
                            className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-shadow duration-300 hover:shadow-sm"
                        >
                            <button
                                type="button"
                                onClick={() => toggle(idx)}
                                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                            >
                                <span className="text-sm font-bold text-gray-900">{item.question}</span>
                                <PlusIcon open={isOpen} />
                            </button>

                            <div
                                className="grid transition-all duration-300 ease-in-out"
                                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                            >
                                <div className="overflow-hidden">
                                    <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </section>
    );
};

export default LandingFAQ;