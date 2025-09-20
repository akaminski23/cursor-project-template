import type { NextApiRequest, NextApiResponse } from 'next';
import packageJson from '../../../package.json';

type HealthResponse = {
  ok: true;
  version: string;
  time: string;
};

export default function handler(_req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  const response: HealthResponse = {
    ok: true,
    version: packageJson.version,
    time: new Date().toISOString()
  };

  res.status(200).json(response);
}
