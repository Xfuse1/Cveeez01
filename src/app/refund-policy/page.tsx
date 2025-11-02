import { PolicyLayout } from '@/components/layout/policy-layout';

export default function RefundPolicyPage() {
  const sections = [
    {
      title: 'Refund Conditions',
      content:
        'To be eligible for a refund, you must submit a request within the specified refund period. Refunds are generally processed for services that have not been rendered or if the service delivered is significantly different from its description. For our AI CV Builder, refunds are not applicable once the CV generation process has been initiated due to the immediate, automated nature of the service.',
    },
    {
      title: 'Refund Period',
      content:
        'The refund period for eligible services is 14 days from the date of purchase. Any refund requests submitted after this period will not be considered. Please ensure you review our services promptly after purchase to determine if they meet your expectations.',
    },
    {
      title: 'How to Request a Refund',
      content:
        "To request a refund, please contact our support team at support@cveeez.online with your order details and a clear explanation of the reason for your request. Our team will review your request and respond within 3-5 business days. Approved refunds will be processed back to the original method of payment.",
    },
    {
      title: 'Processing of Refunds',
      content:
        'Once your refund request is approved, we will initiate a refund to your original method of payment. You will receive the credit within a certain amount of days, depending on your card issuer\'s policies. We will notify you once the refund has been processed on our end.',
    },
  ];

  return <PolicyLayout title="Refund Policy" sections={sections} />;
}
