import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  const TOYO_ID = 19297;

  if (method === 'GET') {
    try {
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${TOYO_ID}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CMC_PRO_API_KEY': '7d2336e0-8cf2-41e2-8caa-9d87bf5d6f15',
          },
          method: 'GET',
        },
      );

      const respJSON = await response.json();
      return res.status(200).json({ data: respJSON });
    } catch (error) {
      console.log(error);
      return res.status(422).json({ message: 'Something went wrong' });
    }
  }

  return res.status(404).send('Not found');
}
