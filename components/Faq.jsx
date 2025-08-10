'use client'
import React, { useState } from 'react'

// --- Define your FAQ data here ---
const faqList = [
  {
    question: 'What types of products can I customize?',
    answer:
      "We offer custom printing on a wide variety of products, including t-shirts, hoodies, mugs, tote bags, hats, and more. If you're looking for something specific, feel free to reach out!",
  },
  {
    question: 'How do I upload my design or artwork?',
    answer:
      'You can upload your artwork directly on the product page using our upload tool. We accept files in formats like PNG, JPG, PDF, and SVG. Make sure your design is high-resolution for best results.',
  },
  {
    question: 'Can I see a preview of my custom product before I order?',
    answer:
      'Yes! Our design tool provides a digital mockup so you can preview how your custom print will look on the product. This helps ensure everything is aligned and sized correctly.',
  },
  {
    question: 'Is there a minimum order quantity?',
    answer:
      'Most of our products have no minimum order, so you can order just one item. For bulk orders, we offer discounts based on quantity.',
  },
  {
    question: 'How long does it take to receive my custom order?',
    answer:
      'Production typically takes 3–7 business days, depending on the product and order volume. Shipping times vary based on your location and selected shipping method.',
  },
  {
    question: 'Can I make changes to my order after placing it?',
    answer:
      'We start production quickly, so changes may only be possible within a short window. Contact us ASAP if you need to update your order.',
  },
  {
    question: 'What if there’s an issue with my custom product?',
    answer:
      'Your satisfaction matters. If your item arrives damaged, misprinted, or different from the preview, please contact us within 7 days of delivery—we’ll make it right.',
  },
]

// --- Sub-component for a single FAQ item ---
const FaqItem = ({ faq, isOpen, onClick }) => {
  return (
    <div className='border-b border-gray-200 py-4'>
      <button
        onClick={onClick}
        className='w-full flex justify-between items-center text-left text-gray-800 hover:text-black focus:outline-none'
      >
        <span className='font-medium'>{faq.question}</span>
        <span
          className={`transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M4 6L8 10L12 6'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 mt-4' : 'max-h-0'
        }`}
      >
        <p className='text-gray-600 text-sm leading-relaxed'>{faq.answer}</p>
      </div>
    </div>
  )
}

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className='bg-[#F9F6F1] py-20'>
      <div className='max-w-3xl mx-auto px-4'>
        <h2 className='text-center text-3xl md:text-4xl font-bold text-gray-800 mb-10'>
          Custom T-shirts FAQ
        </h2>
        <div>
          {faqList.map((faq, index) => (
            <FaqItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Faq
