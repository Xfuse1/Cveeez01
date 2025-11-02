import { PolicyLayout } from '@/components/layout/policy-layout';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'Data We Collect',
      content:
        'We collect information you provide directly to us, such as when you create an account, purchase our services, or contact us. This may include your name, email address, and any other information you choose to provide. We also automatically collect certain information when you visit our website, such as your IP address, browser type, and information about your usage of our site through cookies.',
    },
    {
      title: 'How We Use Your Data',
      content:
        'We use the information we collect to provide, maintain, and improve our services. This includes processing transactions, sending you technical notices and support messages, and communicating with you about products, services, and events. We may also use the information for marketing and analytics purposes to understand our users and improve our offerings.',
    },
    {
      title: 'Information Protection',
      content:
        'We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information.',
    },
    {
      title: 'Cookie Policy',
      content:
        'We use cookies to help us remember and process the items in your shopping cart, understand and save your preferences for future visits, and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.',
    },
    {
      title: 'GDPR Compliance',
      content:
        "If you are a resident of the European Economic Area (EEA), you have certain data protection rights. CVeeez aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. We are committed to ensuring that your privacy is protected and your data is handled in compliance with the General Data Protection Regulation (GDPR).",
    },
    {
      title: 'Changes to This Policy',
      content:
        'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.',
    },
  ];

  return <PolicyLayout title="Privacy Policy" sections={sections} />;
}
