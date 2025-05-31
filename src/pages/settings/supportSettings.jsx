import React, { useState } from 'react';

const faqs = [
  {
    question: 'How do I reset my password?',
    answer:
      'To reset your password, go to the account settings and click on "Change Password". Follow the instructions sent to your email.',
  },
  {
    question: 'How can I upgrade my subscription?',
    answer:
      'You can upgrade your subscription from the Billing & Subscription page by selecting a higher plan.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can contact support by filling out the form below or emailing support@example.com.',
  },
  {
    question: 'Where can I find my invoices?',
    answer:
      'Invoices are available in the Billing & Subscription section under Billing History.',
  },
];

const SupportSettings = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormStatus(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here, you would normally send formData to backend or email service
    setFormStatus('Thank you for reaching out! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className=" mx-auto mt-10 bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Support & Help</h2>
      <p className="mb-8 text-gray-700">We are here to help you. Browse FAQs or contact us directly.</p>

      {/* FAQ Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-md">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left px-4 py-3 flex justify-between items-center text-gray-800 font-medium focus:outline-none"
              >
                <span>{faq.question}</span>
                <span>{openIndex === index ? '-' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="px-4 py-3 text-gray-600 border-t">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Contact Support</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition"
          >
            Send Message
          </button>
          {formStatus && (
            <p className="text-green-600 text-center mt-3">{formStatus}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default SupportSettings;
