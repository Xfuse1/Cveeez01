'use client';

import React from 'react';
import CVGenerator from '@/components/cv-templates/CVGenerator';

/**
 * Wrapper component to make CVGenerator a client component.
 * This allows it to be used directly in the page route.
 */
export default function CVGeneratorWrapper() {
  return <CVGenerator />;
}
