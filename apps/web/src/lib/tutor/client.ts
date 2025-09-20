import type { TutorRequestBody, TutorResponseBody } from './types';
import { validateTutorRequest } from './validate';

const TUTOR_ENDPOINT = '/api/tutor';

/**
 * Call the mock tutor endpoint and return the JSON payload.
 */
export async function sendTutorMessage(body: TutorRequestBody, signal?: AbortSignal): Promise<TutorResponseBody> {
  const payload = validateTutorRequest(body);
  const response = await fetch(TUTOR_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    const message = `Tutor request failed with status ${response.status}.`;
    throw new Error(message);
  }

  const data = (await response.json()) as TutorResponseBody;
  return data;
}
