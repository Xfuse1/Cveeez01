import { PolicyLayout } from '@/components/layout/policy-layout';

export default function TermsAndConditionsPage() {
  const sections = [
    {
      title: 'Terms of Use',
      content:
        'By accessing and using the CVeeez website and its services, you agree to comply with and be bound by the following terms and conditions. If you do not agree to these terms, you should not use our services. These terms apply to all visitors, users, and others who wish to access or use the Service.',
    },
    {
      title: 'User Rights and Responsibilities',
      content:
        'You are responsible for your use of the services and for any content you provide, including compliance with applicable laws, rules, and regulations. You retain your rights to any content you submit, post or display on or through the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content.',
    },
    {
      title: 'Payment and Refund Policy',
      content:
        'All payments for services are due at the time of purchase. We accept various forms of payment as indicated on our website. Our refund policy is detailed in a separate document. By making a purchase, you agree to our payment terms and acknowledge our refund policy.',
    },
    {
      title: 'Age Restriction',
      content:
        'Our services are not intended for individuals under the age of 18. By using our services, you represent and warrant that you are at least 18 years of age. We do not knowingly collect personally identifiable information from anyone under the age of 18.',
    },
    {
      title: 'Governing Law',
      content:
        'These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is established, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.',
    },
  ];

  return <PolicyLayout title="Terms & Conditions" sections={sections} />;
}
