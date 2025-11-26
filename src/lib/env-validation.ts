/**
 * Environment variables validation
 * This file validates required environment variables on startup
 */

const requiredEnvVars = [
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
];

const optionalEnvVars = [
  'GEMINI_MODEL_ID',
  'GROQ_API_KEY',
];

export function validateEnvironmentVariables() {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    return;
  }

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  }

  // Check optional variables
  for (const varName of optionalEnvVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      warnings.push(varName);
    }
  }

  // Log results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Please add these variables to your .env file');

    // Don't throw error during build, only warn
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Application may not work correctly without these variables');
    }
  } else {
    console.log('✅ All required environment variables are configured');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not configured:');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
  }

  // Validate GEMINI_API_KEY format
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    if (!geminiKey.startsWith('AIza')) {
      console.error('❌ GEMINI_API_KEY appears to have invalid format (should start with "AIza")');
    }

    if (geminiKey.length < 30) {
      console.error('❌ GEMINI_API_KEY appears to be too short (likely invalid)');
    }
  }
}

// Export a function to check if environment is ready
export function isEnvironmentReady(): boolean {
  if (typeof window !== 'undefined') {
    return true; // Client side always returns true
  }

  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      return false;
    }
  }

  return true;
}

export function getEnvVar(name: string): string | undefined {
  return process.env[name];
}

export function requireEnvVar(name: string): string {
	const v = getEnvVar(name);
	if (!v) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return v;
}

export function checkEnv(required: string[]): { ok: boolean; missing: string[] } {
	const missing = required.filter((n) => !getEnvVar(n));
	return { ok: missing.length === 0, missing };
}
