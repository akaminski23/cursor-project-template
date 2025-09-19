export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkResponse {
  success: boolean;
  message: string;
}

/**
 * Mocked magic-link sender that simulates email auth.
 */
export async function sendMagicLink({ email }: MagicLinkRequest): Promise<MagicLinkResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    success: true,
    message: `A magic link would be sent to ${email} in production.`
  };
}

export interface MockUser {
  id: string;
  email: string;
  name?: string;
}

/**
 * Returns a mocked user record for local development.
 */
export function getMockUser(): MockUser {
  return {
    id: 'demo-user-1',
    email: 'demo@ai2dor.test',
    name: 'Demo Learner'
  };
}
